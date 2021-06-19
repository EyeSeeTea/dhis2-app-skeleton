import { UseCase } from "../../../CompositionRoot";
import { User } from "../../entities/User";
import { ConfigRepository } from "../../repositories/ConfigRepository";

export class GetCurrentUserUseCase implements UseCase {
    constructor(private trainingModuleRepository: ConfigRepository) {}

    public async execute(): Promise<User> {
        return this.trainingModuleRepository.getCurrentUser();
    }
}
