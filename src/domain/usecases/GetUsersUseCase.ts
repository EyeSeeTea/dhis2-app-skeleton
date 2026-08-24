import { FutureData } from "$/domain/entities/generic/Future";
import { User } from "$/domain/entities/User";
import { Paginated } from "$/domain/entities/generic/Pagination";
import { GetUsersOptions, UserRepository } from "$/domain/repositories/UserRepository";

export class GetUsersUseCase {
    constructor(private repositories: { userRepository: UserRepository }) {}

    execute(options: GetUsersOptions): FutureData<Paginated<User>> {
        return this.repositories.userRepository.get(options);
    }
}
