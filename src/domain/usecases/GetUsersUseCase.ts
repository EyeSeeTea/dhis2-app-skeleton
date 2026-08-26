import { FutureData } from "$/domain/entities/generic/Future";
import { User } from "$/domain/entities/User";
import { Paginated } from "$/domain/entities/generic/Pagination";
import { GetUsersOptions, UserRepository } from "$/domain/repositories/UserRepository";

export class GetUsersUseCase {
    constructor(private userRepository: UserRepository) {}

    execute(options: GetUsersOptions): FutureData<Paginated<User>> {
        return this.userRepository.get(options);
    }
}
