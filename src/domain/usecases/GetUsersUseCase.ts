import { FutureData } from "$/data/api-futures";
import { User } from "$/domain/entities/User";
import { PaginatedResponse } from "$/domain/entities/generic/Pagination";
import { GetUsersOptions, UserRepository } from "$/domain/repositories/UserRepository";

export class GetUsersUseCase {
    constructor(private options: { userRepository: UserRepository }) {}

    public execute(options: GetUsersOptions): FutureData<PaginatedResponse<User>> {
        return this.options.userRepository.get(options);
    }
}
