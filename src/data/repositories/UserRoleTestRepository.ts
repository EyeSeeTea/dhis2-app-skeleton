import { Future, FutureData } from "$/domain/entities/generic/Future";
import { UserRole } from "$/domain/entities/UserRole";
import { UserRoleRepository } from "$/domain/repositories/UserRoleRepository";

export class UserRoleTestRepository implements UserRoleRepository {
    getAll(): FutureData<UserRole[]> {
        return Future.success([
            new UserRole({ id: "ur1", name: "Super user", authorities: ["ALL"] }),
        ]);
    }
}
