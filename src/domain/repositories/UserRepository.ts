import { FutureData } from "../../data/api-futures";
import { User } from "../entities/User";

export interface UserRepository {
    getCurrent(): FutureData<User>;
}
