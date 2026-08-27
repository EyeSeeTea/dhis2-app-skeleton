import { describe, expect, it } from "vitest";
import {
    anything,
    capture,
    deepEqual,
    imock,
    instance,
    verify,
    when,
} from "@johanblumenberg/ts-mockito";
import { Future } from "$/domain/entities/generic/Future";
import { Id } from "$/domain/entities/Ref";
import { User } from "$/domain/entities/User";
import { UserRole } from "$/domain/entities/UserRole";
import { createUser } from "$/domain/entities/__tests__/userFixtures";
import { GetUsersOptions, UserRepository } from "$/domain/repositories/UserRepository";
import { UserRoleRepository } from "$/domain/repositories/UserRoleRepository";
import { GetUserReportUseCase } from "$/domain/usecases/GetUserReportUseCase";

describe("GetUserReportUseCase", () => {
    describe("when the users span more than one page", () => {
        it("requests pages until the pager is exhausted", async () => {
            const users = createUsers(250);
            const userRepository = fakeUserRepository(users);
            const useCase = createUseCase({ users: userRepository.instance });

            const report = await useCase.execute().toPromise();

            expect(report.totalUsers).toBe(250);
            expect(
                capture(userRepository.mock.get)
                    .all()
                    .map(call => call[0].page)
            ).toEqual([1, 2, 3]);
        });

        it("requests all the users, with no filters and a stable order", async () => {
            const userRepository = fakeUserRepository(createUsers(2));
            const useCase = createUseCase({ users: userRepository.instance });

            await useCase.execute().toPromise();

            const expectedCall: GetUsersOptions = {
                page: 1,
                pageSize: 100,
                filters: { userGroupIds: undefined, userRoleIds: undefined, disabled: undefined },
                order: { field: "name", order: "asc" },
            };
            verify(userRepository.mock.get(deepEqual(expectedCall))).once();
        });
    });

    describe("counters", () => {
        it("splits the users into admins and non-admins", async () => {
            const users = [
                createUser({ id: "user1", isAdmin: true }),
                createUser({ id: "user2", isAdmin: false }),
                createUser({ id: "user3", isAdmin: false }),
            ];
            const useCase = createUseCase({ users: fakeUserRepository(users).instance });

            const report = await useCase.execute().toPromise();

            expect(report.totalUsers).toBe(3);
            expect(report.adminCount).toBe(1);
            expect(report.nonAdminCount).toBe(2);
        });

        it("returns an empty report when there are no users", async () => {
            const useCase = createUseCase({ users: fakeUserRepository([]).instance });

            const report = await useCase.execute().toPromise();

            expect(report.totalUsers).toBe(0);
            expect(report.adminCount).toBe(0);
            expect(report.nonAdminCount).toBe(0);
            expect(report.usersWithMultipleRoles).toEqual([]);
            expect(report.uniqueAuthorities).toEqual([]);
        });
    });

    describe("usersWithMultipleRoles", () => {
        it("returns only the users with more than one role", async () => {
            const users = [
                createUser({ id: "user1", name: "No roles", userRoleIds: [] }),
                createUser({ id: "user2", name: "One role", userRoleIds: ["role1"] }),
                createUser({ id: "user3", name: "Two roles", userRoleIds: ["role1", "role2"] }),
            ];
            const useCase = createUseCase({ users: fakeUserRepository(users).instance });

            const report = await useCase.execute().toPromise();

            expect(report.usersWithMultipleRoles.map(user => user.name)).toEqual(["Two roles"]);
        });
    });

    describe("rolesSortedByUsage", () => {
        it("returns all the roles, with their user count, most used first", async () => {
            const users = [
                createUser({ id: "user1", userRoleIds: ["role1", "role2"] }),
                createUser({ id: "user2", userRoleIds: ["role2"] }),
                createUser({ id: "user3", userRoleIds: ["role2"] }),
            ];
            const roles = [
                createUserRole({ id: "role1", name: "Role 1" }),
                createUserRole({ id: "role2", name: "Role 2" }),
                createUserRole({ id: "role3", name: "Unassigned role" }),
            ];
            const useCase = createUseCase({
                users: fakeUserRepository(users).instance,
                roles: fakeUserRoleRepository(roles),
            });

            const report = await useCase.execute().toPromise();

            expect(report.rolesSortedByUsage.map(obj => [obj.role.name, obj.userCount])).toEqual([
                ["Role 2", 3],
                ["Role 1", 1],
                ["Unassigned role", 0],
            ]);
        });
    });

    describe("uniqueAuthorities", () => {
        it("returns the sorted authorities of the roles assigned to users, without duplicates", async () => {
            const users = [
                createUser({ id: "user1", userRoleIds: ["role1"] }),
                createUser({ id: "user2", userRoleIds: ["role2"] }),
            ];
            const roles = [
                createUserRole({ id: "role1", authorities: ["F_USER_ADD", "ALL"] }),
                createUserRole({ id: "role2", authorities: ["F_USER_ADD", "F_USER_DELETE"] }),
            ];
            const useCase = createUseCase({
                users: fakeUserRepository(users).instance,
                roles: fakeUserRoleRepository(roles),
            });

            const report = await useCase.execute().toPromise();

            expect(report.uniqueAuthorities).toEqual(["ALL", "F_USER_ADD", "F_USER_DELETE"]);
        });

        it("skips the roles not assigned to any user", async () => {
            const users = [createUser({ id: "user1", userRoleIds: ["role1"] })];
            const roles = [
                createUserRole({ id: "role1", authorities: ["F_USER_ADD"] }),
                createUserRole({ id: "role2", authorities: ["F_USER_DELETE"] }),
            ];
            const useCase = createUseCase({
                users: fakeUserRepository(users).instance,
                roles: fakeUserRoleRepository(roles),
            });

            const report = await useCase.execute().toPromise();

            expect(report.uniqueAuthorities).toEqual(["F_USER_ADD"]);
        });

        it("skips the role ids of users that have no matching role", async () => {
            const users = [createUser({ id: "user1", userRoleIds: ["role1", "unknownRole"] })];
            const roles = [createUserRole({ id: "role1", authorities: ["F_USER_ADD"] })];
            const useCase = createUseCase({
                users: fakeUserRepository(users).instance,
                roles: fakeUserRoleRepository(roles),
            });

            const report = await useCase.execute().toPromise();

            expect(report.uniqueAuthorities).toEqual(["F_USER_ADD"]);
        });
    });
});

function createUseCase(options: {
    users: UserRepository;
    roles?: UserRoleRepository;
}): GetUserReportUseCase {
    return new GetUserReportUseCase(options.users, options.roles ?? fakeUserRoleRepository([]));
}

/* Repository doubles built with ts-mockito: the mocks satisfy the whole domain interface
   compile-time (no hand-written stubs), calls are verified against the real signatures. */

function fakeUserRepository(users: User[]) {
    const repository = imock<UserRepository>();

    when(repository.get(anything())).thenCall(({ page, pageSize }: GetUsersOptions) => {
        return Future.success({
            pager: {
                page: page,
                pageSize: pageSize,
                total: users.length,
                pageCount: Math.ceil(users.length / pageSize),
            },
            objects: users.slice((page - 1) * pageSize, page * pageSize),
        });
    });

    return { mock: repository, instance: instance(repository) };
}

function fakeUserRoleRepository(roles: UserRole[]): UserRoleRepository {
    const repository = imock<UserRoleRepository>();
    when(repository.getAll()).thenReturn(Future.success(roles));

    return instance(repository);
}

function createUsers(count: number): User[] {
    return Array.from({ length: count }, (_value, index) =>
        createUser({ id: `user${index + 1}`, name: `User ${index + 1}` })
    );
}

function createUserRole(options: { id: Id; name?: string; authorities?: string[] }): UserRole {
    return new UserRole({
        id: options.id,
        name: options.name ?? `Role ${options.id}`,
        authorities: options.authorities ?? [],
    });
}
