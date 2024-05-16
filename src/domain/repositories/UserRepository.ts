import { FutureData } from "$/data/api-futures";
import { User } from "$/domain/entities/User";

export interface UserRepository {
    getCurrent(): FutureData<User>;
}
