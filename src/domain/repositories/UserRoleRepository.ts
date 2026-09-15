import { FutureData } from "$/domain/entities/generic/Future";
import { UserRole } from "$/domain/entities/UserRole";

export interface UserRoleRepository {
    getAll(): FutureData<UserRole[]>;
}
