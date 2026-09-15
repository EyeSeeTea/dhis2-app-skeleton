import { FutureData } from "$/domain/entities/generic/Future";
import { UserGroup } from "$/domain/entities/UserGroup";

export interface UserGroupRepository {
    getAll(): FutureData<UserGroup[]>;
}
