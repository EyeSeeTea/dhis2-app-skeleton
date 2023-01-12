import { FutureData } from "../entities/Future";
import { InstanceRepository } from "../repositories/InstanceRepository";

export class GetInstanceVersionUseCase {
    constructor(private instanceRepository: InstanceRepository) {}

    public execute(): FutureData<string> {
        return this.instanceRepository.getInstanceVersion();
    }
}
