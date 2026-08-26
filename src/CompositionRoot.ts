import { UserD2Repository } from "./data/repositories/UserD2Repository";
import { UserGroupD2Repository } from "./data/repositories/UserGroupD2Repository";
import { UserGroupTestRepository } from "./data/repositories/UserGroupTestRepository";
import { UserRoleD2Repository } from "./data/repositories/UserRoleD2Repository";
import { UserRoleTestRepository } from "./data/repositories/UserRoleTestRepository";
import { UserTestRepository } from "./data/repositories/UserTestRepository";
import { UserGroupRepository } from "./domain/repositories/UserGroupRepository";
import { UserRepository } from "./domain/repositories/UserRepository";
import { UserRoleRepository } from "./domain/repositories/UserRoleRepository";
import { GetCurrentUserUseCase } from "./domain/usecases/GetCurrentUserUseCase";
import { GetUserGroupsUseCase } from "./domain/usecases/GetUserGroupsUseCase";
import { GetUserRolesUseCase } from "./domain/usecases/GetUserRolesUseCase";
import { GetUsersUseCase } from "./domain/usecases/GetUsersUseCase";
import { D2Api } from "./types/d2-api";

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;

type Repositories = {
    userRepository: UserRepository;
    userGroupRepository: UserGroupRepository;
    userRoleRepository: UserRoleRepository;
};

function getCompositionRoot(repositories: Repositories) {
    const { userRepository, userGroupRepository, userRoleRepository } = repositories;

    return {
        users: {
            getCurrent: new GetCurrentUserUseCase(userRepository),
            get: new GetUsersUseCase(userRepository),
        },
        userGroups: {
            get: new GetUserGroupsUseCase(userGroupRepository),
        },
        userRoles: {
            get: new GetUserRolesUseCase(userRoleRepository),
        },
    };
}

export function getWebappCompositionRoot(api: D2Api) {
    const repositories = {
        userRepository: new UserD2Repository(api),
        userGroupRepository: new UserGroupD2Repository(api),
        userRoleRepository: new UserRoleD2Repository(api),
    };

    return getCompositionRoot(repositories);
}

export function getTestCompositionRoot() {
    const repositories = {
        userRepository: new UserTestRepository(),
        userGroupRepository: new UserGroupTestRepository(),
        userRoleRepository: new UserRoleTestRepository(),
    };

    return getCompositionRoot(repositories);
}
