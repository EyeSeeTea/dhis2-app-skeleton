import { Future } from "$/domain/entities/generic/Future";
import { UserRole } from "$/domain/entities/UserRole";
import { UserRoleRepository } from "$/domain/repositories/UserRoleRepository";
import { FutureData } from "$/data/api-futures";

export class UserRoleTestRepository implements UserRoleRepository {
    getAll(): FutureData<UserRole[]> {
        return Future.success([
            new UserRole({ id: "ur1", name: "Super user", authorities: ["ALL"] }),
        ]);
    }
}
