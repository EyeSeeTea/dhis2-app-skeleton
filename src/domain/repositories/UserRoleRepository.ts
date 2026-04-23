import { FutureData } from "$/data/api-futures";
import { UserRole } from "$/domain/entities/UserRole";

export interface UserRoleRepository {
    getAll(): FutureData<UserRole[]>;
}
