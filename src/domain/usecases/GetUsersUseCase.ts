import { FutureData } from "$/data/api-futures";
import { User } from "$/domain/entities/User";
import { Paginated } from "$/domain/entities/generic/Pagination";
import { GetUsersOptions, UserRepository } from "$/domain/repositories/UserRepository";

export class GetUsersUseCase {
    constructor(private options: { userRepository: UserRepository }) {}

    public execute(options: GetUsersOptions): FutureData<Paginated<User>> {
        return this.options.userRepository.get(options);
    }
}
