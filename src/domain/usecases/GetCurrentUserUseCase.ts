import { FutureData } from "$/domain/entities/generic/Future";
import { User } from "$/domain/entities/User";
import { UserRepository } from "$/domain/repositories/UserRepository";

export class GetCurrentUserUseCase {
    constructor(private repositories: { userRepository: UserRepository }) {}

    execute(): FutureData<User> {
        return this.repositories.userRepository.getCurrent();
    }
}
