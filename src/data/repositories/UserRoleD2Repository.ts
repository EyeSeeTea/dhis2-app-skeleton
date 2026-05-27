import { UserRole } from "$/domain/entities/UserRole";
import { UserRoleRepository } from "$/domain/repositories/UserRoleRepository";
import { apiToFuture, FutureData } from "$/data/api-futures";
import { D2Api } from "$/types/d2-api";

export class UserRoleD2Repository implements UserRoleRepository {
    constructor(private api: D2Api) {}

    getAll(): FutureData<UserRole[]> {
        return apiToFuture(
            this.api.models.userRoles.get({
                fields: { id: true, displayName: true, authorities: true },
                paging: false,
                order: "displayName:asc",
            })
        ).map(({ objects }) =>
            objects.map(
                role =>
                    new UserRole({
                        id: role.id,
                        name: role.displayName,
                        authorities: role.authorities,
                    })
            )
        );
    }
}
