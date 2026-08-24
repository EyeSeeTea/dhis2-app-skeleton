import { UserGroup } from "$/domain/entities/UserGroup";
import { UserGroupRepository } from "$/domain/repositories/UserGroupRepository";
import { apiToFuture } from "$/data/api-futures";
import { FutureData } from "$/domain/entities/generic/Future";
import { D2Api } from "$/types/d2-api";

export class UserGroupD2Repository implements UserGroupRepository {
    constructor(private api: D2Api) {}

    getAll(): FutureData<UserGroup[]> {
        return apiToFuture(
            this.api.models.userGroups.get({
                fields: { id: true, displayName: true },
                paging: false,
                order: "displayName:asc",
            })
        ).map(({ objects }) =>
            objects.map(group => new UserGroup({ id: group.id, name: group.displayName }))
        );
    }
}
