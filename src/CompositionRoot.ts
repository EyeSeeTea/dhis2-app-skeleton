import { Instance } from "./data/entities/Instance";
import { InstanceDefaultRepository } from "./data/repositories/InstanceDefaultRepository";
import { UserD2Repository } from "./data/repositories/UserD2Repository";
import { GetCurrentUserUseCase } from "./domain/usecases/GetCurrentUserUseCase";
import { GetInstanceVersionUseCase } from "./domain/usecases/GetInstanceVersionUseCase";
import { D2Api } from "./types/d2-api";

export function getCompositionRoot(api: D2Api, instance: Instance) {
    const instanceRepository = new InstanceDefaultRepository(instance);
    const usersRepository = new UserD2Repository(api);

    return {
        instance: {
            getVersion: new GetInstanceVersionUseCase(instanceRepository),
        },
        users: {
            getCurrent: new GetCurrentUserUseCase(usersRepository),
        },
    };
}

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;
