import { FutureData } from "$/data/api-futures";
import { User } from "$/domain/entities/User";
import { Paginated } from "$/domain/entities/generic/Pagination";
import { GetUsersOptions, UserRepository } from "$/domain/repositories/UserRepository";

export class GetUsersUseCase {
    constructor(private repositories: { userRepository: UserRepository }) {}

    public execute(options: GetUsersOptions): FutureData<Paginated<User>> {
        return this.repositories.userRepository.get(options);
    }
}
