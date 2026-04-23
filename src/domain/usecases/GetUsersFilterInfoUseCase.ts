import { FutureData } from "$/data/api-futures";
import { Future } from "$/domain/entities/generic/Future";
import { UserGroup } from "$/domain/entities/UserGroup";
import { UserRole } from "$/domain/entities/UserRole";
import { UserGroupRepository } from "$/domain/repositories/UserGroupRepository";
import { UserRoleRepository } from "$/domain/repositories/UserRoleRepository";

export type UsersFilterInfo = {
    userGroups: UserGroup[];
    userRoles: UserRole[];
};

export class GetUsersFilterInfoUseCase {
    constructor(
        private options: {
            userGroupRepository: UserGroupRepository;
            userRoleRepository: UserRoleRepository;
        }
    ) {}

    public execute(): FutureData<UsersFilterInfo> {
        return Future.joinObj({
            userGroups: this.options.userGroupRepository.getAll(),
            userRoles: this.options.userRoleRepository.getAll(),
        });
    }
}
