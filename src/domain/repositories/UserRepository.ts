import { FutureData } from "../entities/Future";
import { User } from "../entities/User";

export interface UserRepository {
    getCurrent(): FutureData<User>;
}
