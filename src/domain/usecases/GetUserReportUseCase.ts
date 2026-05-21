import { FutureData } from "$/data/api-futures";
import { Future } from "$/domain/entities/generic/Future";
import _c from "$/domain/entities/generic/Collection";
import { UserReport } from "$/domain/entities/UserReport";
import { UserRepository } from "$/domain/repositories/UserRepository";
import { UserRoleRepository } from "$/domain/repositories/UserRoleRepository";

export class GetUserReportUseCase {
    constructor(
        private options: {
            userRepository: UserRepository;
            userRoleRepository: UserRoleRepository;
        }
    ) {}

    execute(): FutureData<UserReport> {
        return Future.joinObj({
            usersPage: this.options.userRepository.get({
                search: "",
                page: 1,
                pageSize: 1000,
                filters: { userGroupIds: undefined, userRoleIds: undefined, canLogin: undefined },
            }),
            roles: this.options.userRoleRepository.getAll(),
        }).map(({ usersPage, roles }) => {
            const users = _c(usersPage.objects);
            const rolesCollection = _c(roles);

            // Build a lookup map for O(1) role resolution by id
            const roleById = rolesCollection.indexBy(role => role.id);

            const adminCount = users.filter(u => u.isAdmin).size;
            const nonAdminCount = users.reject(u => u.isAdmin).size;

            const usersWithMultipleRoles = users.filter(u => u.userRoleIds.length > 1).value();

            const rolesSortedByUsage = rolesCollection
                .map(role => ({
                    role,
                    userCount: users.filter(u => u.userRoleIds.includes(role.id)).size,
                }))
                .orderBy([[(s) => s.userCount, "desc"]])
                .value();

            // Resolve each user's role IDs to roles, collect all authorities, deduplicate
            const uniqueAuthorities = users
                .flatMap(u => _c(u.userRoleIds).compactMap(id => roleById.get(id)))
                .flatMap(role => _c(role.authorities))
                .uniq()
                .sort()
                .value();

            return {
                totalUsers: users.size,
                adminCount,
                nonAdminCount,
                usersWithMultipleRoles,
                rolesSortedByUsage,
                uniqueAuthorities,
            };
        });
    }
}
