import { FutureData } from "$/data/api-futures";
import { Future } from "$/domain/entities/generic/Future";
import _c from "$/domain/entities/generic/Collection";
import { UserReport } from "$/domain/entities/UserReport";
import { UserRepository } from "$/domain/repositories/UserRepository";
import { UserRoleRepository } from "$/domain/repositories/UserRoleRepository";

export class GetUserReportUseCase {
    constructor(
        private repositories: {
            userRepository: UserRepository;
            userRoleRepository: UserRoleRepository;
        }
    ) {}

    execute(): FutureData<UserReport> {
        return Future.joinObj({
            usersPage: this.repositories.userRepository.get({
                search: "",
                page: 1,
                pageSize: 1000,
                filters: { userGroupIds: undefined, userRoleIds: undefined, canLogin: undefined },
            }),
            roles: this.repositories.userRoleRepository.getAll(),
        }).map(({ usersPage, roles }): UserReport => {
            // Using an explicit return type here allows TypeScript to validate the object literal
            // against the 'UserReport' interface immediately. This provides instant type-checking,
            // superior autocompletion, and safer refactoring support within the block.
            const users = _c(usersPage.objects);
            const rolesCollection = _c(roles);

            // Build a lookup map for O(1) role resolution by id
            const roleById = rolesCollection.indexBy(role => role.id);

            const adminCount = users.filter(user => user.isAdmin).size;
            const nonAdminCount = users.reject(user => user.isAdmin).size;

            const usersWithMultipleRoles = users.filter(u => u.userRoleIds.length > 1).value();

            const rolesSortedByUsage = rolesCollection
                .map(role => ({
                    role: role,
                    userCount: users.filter(user => user.userRoleIds.includes(role.id)).size,
                }))
                .orderBy([[obj => obj.userCount, "desc"]])
                .value();

            // Resolve each user's role IDs to roles, collect all authorities, deduplicate
            const uniqueAuthorities = users
                .flatMap(user => user.userRoleIds)
                .compactMap(userRoleId => roleById.get(userRoleId))
                .flatMap(role => role.authorities)
                .uniq()
                .sort()
                .value();

            // Note how we use explicit `key: value` even if the key and value have the same name.
            // This improves navigability (we can either go to the prop type or the value variable).
            return {
                totalUsers: users.size,
                adminCount: adminCount,
                nonAdminCount: nonAdminCount,
                usersWithMultipleRoles: usersWithMultipleRoles,
                rolesSortedByUsage: rolesSortedByUsage,
                uniqueAuthorities: uniqueAuthorities,
            };
        });
    }
}
