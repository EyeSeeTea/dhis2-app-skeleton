import { User } from "$/domain/entities/User";
import { GetUsersOptions, UserRepository } from "$/domain/repositories/UserRepository";
import { PaginatedResponse } from "$/domain/entities/generic/Pagination";
import { D2Api, MetadataPick } from "$/types/d2-api";
import { apiToFuture, FutureData } from "$/data/api-futures";
import { getId } from "$/domain/entities/Ref";

export class UserD2Repository implements UserRepository {
    constructor(private api: D2Api) {}

    public getCurrent(): FutureData<User> {
        return apiToFuture(
            this.api.currentUser.get({
                fields: userFields,
            })
        ).map(d2User => this.buildUser(d2User));
    }

    public get(options: GetUsersOptions): FutureData<PaginatedResponse<User>> {
        const { search, page, pageSize, filters } = options;

        return apiToFuture(
            this.api.models.users.get({
                fields: userFields,
                page: page,
                pageSize: pageSize,
                filter: buildFilter(filters, search),
                order: "displayName:asc",
            })
        ).map(({ pager, objects }) => ({
            pager: pager,
            objects: objects.map(d2User => this.buildUser(d2User)),
        }));
    }

    private buildUser(d2User: D2User): User {
        return new User({
            id: d2User.id,
            name: d2User.displayName,
            username: d2User.username,
            userGroupIds: d2User.userGroups.map(getId),
            userRoleIds: d2User.userRoles.map(getId),
            isAdmin: hasAllAuthority(d2User.userRoles),
        });
    }
}

function hasAllAuthority(roles: ReadonlyArray<{ authorities: string[] }>): boolean {
    return roles.some(role => role.authorities.includes("ALL"));
}

function buildFilter(filters: GetUsersOptions["filters"], search: string) {
    return {
        identifiable: { token: search },
        ...(filters.userGroupIds?.length ? { "userGroups.id": { in: filters.userGroupIds } } : {}),
        ...(filters.userRoleIds?.length ? { "userRoles.id": { in: filters.userRoleIds } } : {}),
        ...(filters.canLogin === true
            ? { disabled: { eq: "false" } }
            : filters.canLogin === false
              ? { disabled: { eq: "true" } }
              : {}),
    };
}

const userFields = {
    id: true,
    displayName: true,
    username: true,
    userGroups: { id: true },
    userRoles: { id: true, authorities: true },
} as const;

type D2User = MetadataPick<{ users: { fields: typeof userFields } }>["users"][number];
