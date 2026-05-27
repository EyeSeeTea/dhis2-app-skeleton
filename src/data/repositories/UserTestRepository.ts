import { User } from "$/domain/entities/User";
import {
    createAdminUser,
    createNonAdminUser,
    createUser,
} from "$/domain/entities/__tests__/userFixtures";
import { Future } from "$/domain/entities/generic/Future";
import { Paginated } from "$/domain/entities/generic/Pagination";
import { GetUsersOptions, UserRepository } from "$/domain/repositories/UserRepository";
import { FutureData } from "$/data/api-futures";

export class UserTestRepository implements UserRepository {
    public getCurrent(): FutureData<User> {
        return Future.success(createAdminUser());
    }

    public get(options: GetUsersOptions): FutureData<Paginated<User>> {
        const { page, pageSize } = options;
        const all = [
            createAdminUser(),
            createNonAdminUser(),
            createUser({ isAdmin: false, userGroupIds: [], userRoleIds: [] }),
        ];
        const paged = all.slice((page - 1) * pageSize, page * pageSize);

        return Future.success({
            pager: {
                page: page,
                pageSize: pageSize,
                total: all.length,
                pageCount: Math.ceil(all.length / pageSize),
            },
            objects: paged,
        });
    }
}
