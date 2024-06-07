import { User } from "$/domain/entities/User";
import { createAdminUser } from "$/domain/entities/__tests__/userFixtures";
import { Future } from "$/domain/entities/generic/Future";
import { UserRepository } from "$/domain/repositories/UserRepository";
import { FutureData } from "$/data/api-futures";

export class UserTestRepository implements UserRepository {
    public getCurrent(): FutureData<User> {
        return Future.success(createAdminUser());
    }
}
