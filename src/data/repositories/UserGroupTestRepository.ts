import { Future, FutureData } from "$/domain/entities/generic/Future";
import { UserGroup } from "$/domain/entities/UserGroup";
import { UserGroupRepository } from "$/domain/repositories/UserGroupRepository";

export class UserGroupTestRepository implements UserGroupRepository {
    getAll(): FutureData<UserGroup[]> {
        return Future.success([new UserGroup({ id: "ug1", name: "Administrators" })]);
    }
}
