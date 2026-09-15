import { FutureData } from "$/domain/entities/generic/Future";
import { UserGroup } from "$/domain/entities/UserGroup";
import { UserGroupRepository } from "$/domain/repositories/UserGroupRepository";

export class GetUserGroupsUseCase {
    constructor(private userGroupRepository: UserGroupRepository) {}

    execute(): FutureData<UserGroup[]> {
        return this.userGroupRepository.getAll();
    }
}
