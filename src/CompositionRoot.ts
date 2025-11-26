import { MapD2Repository } from "$/data/repositories/MapD2Repository";
import { MapTestRepository } from "$/data/repositories/MapTestRepository";
import { MapRepository } from "$/domain/repositories/MapRepository";
import { GetMapsUseCase } from "$/domain/usecases/GetMapUseCase";
import { UserD2Repository } from "./data/repositories/UserD2Repository";
import { UserTestRepository } from "./data/repositories/UserTestRepository";
import { UserRepository } from "./domain/repositories/UserRepository";
import { GetCurrentUserUseCase } from "./domain/usecases/GetCurrentUserUseCase";
import { D2Api } from "./types/d2-api";

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;

type Repositories = {
    userRepository: UserRepository;
    mapRepository: MapRepository;
};

function getCompositionRoot(repositories: Repositories) {
    return {
        users: {
            getCurrent: new GetCurrentUserUseCase(repositories),
        },
        maps: {
            getMap: new GetMapsUseCase(repositories.mapRepository),
        },
    };
}

export function getWebappCompositionRoot(api: D2Api) {
    const repositories: Repositories = {
        userRepository: new UserD2Repository(api),
        mapRepository: new MapD2Repository(),
    };

    return getCompositionRoot(repositories);
}

export function getTestCompositionRoot() {
    const repositories: Repositories = {
        userRepository: new UserTestRepository(),
        mapRepository: new MapTestRepository(),
    };

    return getCompositionRoot(repositories);
}
