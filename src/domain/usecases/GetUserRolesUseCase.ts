import { FutureData } from "$/domain/entities/generic/Future";
import { UserRole } from "$/domain/entities/UserRole";
import { UserRoleRepository } from "$/domain/repositories/UserRoleRepository";

export class GetUserRolesUseCase {
    constructor(private userRoleRepository: UserRoleRepository) {}

    execute(): FutureData<UserRole[]> {
        return this.userRoleRepository.getAll();
    }
}
