import { User } from "../entities/User";

export interface ConfigRepository {
    getCurrentUser(): Promise<User>;
}
