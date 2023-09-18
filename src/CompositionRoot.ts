import { UserD2Repository } from "./data/repositories/UserD2Repository";
import { GetCurrentUserUseCase } from "./domain/usecases/GetCurrentUserUseCase";
import { D2Api } from "./types/d2-api";

export function getCompositionRoot(api: D2Api) {
    const usersRepository = new UserD2Repository(api);

    return {
        users: {
            getCurrent: new GetCurrentUserUseCase(usersRepository),
        },
    };
}

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;
