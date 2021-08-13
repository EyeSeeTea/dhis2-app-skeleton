import { FutureData } from "../entities/Future";
import { User } from "../entities/User";

export interface InstanceRepository {
    getBaseUrl(): string;
    getCurrentUser(): FutureData<User>;
    getInstanceVersion(): FutureData<string>;
}
