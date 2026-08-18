import { Future, FutureData } from "$/domain/entities/generic/Future";
import _c from "$/domain/entities/generic/Collection";
import { UserReport } from "$/domain/entities/UserReport";
import { UsersFilters, UserRepository } from "$/domain/repositories/UserRepository";
import { UserRoleRepository } from "$/domain/repositories/UserRoleRepository";
import { User } from "$/domain/entities/User";

const emptyFilters: UsersFilters = {
    userGroupIds: undefined,
    userRoleIds: undefined,
    disabled: undefined,
};

export class GetUserReportUseCase {
    constructor(
        private repositories: {
            userRepository: UserRepository;
            userRoleRepository: UserRoleRepository;
        }
    ) {}

    execute(): FutureData<UserReport> {
        const data$ = {
            users: this.getAllUsers(),
            roles: this.repositories.userRoleRepository.getAll(),
        };

        return Future.joinObj(data$, { concurrency: 2 }).map(({ users, roles }): UserReport => {
            // Using an explicit return type here allows TypeScript to validate the object literal
            // against the 'UserReport' interface immediately. This provides instant type-checking,
            // superior autocompletion, and safer refactoring support within the block.
            const adminCount = _c(users).filter(user => user.isAdmin).size;
            const nonAdminCount = _c(users).reject(user => user.isAdmin).size;
            const usersWithMultipleRoles = _c(users)
                .filter(user => user.userRoleIds.length > 1)
                .value();

            const rolesSortedByUsage = _c(roles)
                .map(role => ({
                    role: role,
                    userCount: _c(users).filter(user => user.userRoleIds.includes(role.id)).size,
                }))
                .orderBy([[obj => obj.userCount, "desc"]])
                .value();

            const roleById = _c(roles).indexBy(role => role.id);

            const uniqueAuthorities = _c(users)
                .flatMap(user => user.userRoleIds)
                .compactMap(userRoleId => roleById.get(userRoleId))
                .flatMap(role => role.authorities)
                .uniq()
                .sort()
                .value();

            return {
                totalUsers: users.length,
                adminCount: adminCount,
                nonAdminCount: nonAdminCount,
                usersWithMultipleRoles: usersWithMultipleRoles,
                rolesSortedByUsage: rolesSortedByUsage,
                uniqueAuthorities: uniqueAuthorities,
            };
        });
    }

    // Fetches all users from the repository, handling pagination internally.
    private getAllUsers(): FutureData<User[]> {
        return Future.block(async $ => {
            const allUsers: User[] = [];
            let page = 1;
            let pageCount = 1;

            do {
                const users = await $(
                    this.repositories.userRepository.get({
                        page: page,
                        pageSize: 100,
                        filters: emptyFilters,
                        order: { field: "name", order: "asc" },
                    })
                );

                allUsers.push(...users.objects);

                pageCount = users.pager.pageCount;
                page++;
            } while (page <= pageCount);

            return allUsers;
        });
    }
}
