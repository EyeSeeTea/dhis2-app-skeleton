import { FutureData } from "../entities/Future";
import { User } from "../entities/User";
import { UserRepository } from "../repositories/UserRepository";

export class GetCurrentUserUseCase {
    constructor(private usersRepository: UserRepository) {}

    public execute(): FutureData<User> {
        return this.usersRepository.getCurrent();
    }
}
