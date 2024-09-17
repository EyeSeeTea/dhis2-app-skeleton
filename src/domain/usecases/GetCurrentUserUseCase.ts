import { FutureData } from "$/data/api-futures";
import { User } from "$/domain/entities/User";
import { UserRepository } from "$/domain/repositories/UserRepository";

export class GetCurrentUserUseCase {
    constructor(private options: { usersRepository: UserRepository }) {}

    public execute(): FutureData<User> {
        return this.options.usersRepository.getCurrent();
    }
}
