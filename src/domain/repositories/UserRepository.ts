import { FutureData } from "$/data/api-futures";
import { Paginated } from "$/domain/entities/generic/Pagination";
import { Id } from "$/domain/entities/Ref";
import { User } from "$/domain/entities/User";
import { Maybe } from "$/utils/ts-utils";

export interface UserRepository {
    getCurrent(): FutureData<User>;
    get(options: GetUsersOptions): FutureData<Paginated<User>>;
}

export type GetUsersOptions = {
    search?: string;
    page: number;
    pageSize: number;
    filters: UsersFilters;
    order: { field: "name" | "username"; order: "asc" | "desc" };
};

export type UsersFilters = {
    userGroupIds: Maybe<Id[]>;
    userRoleIds: Maybe<Id[]>;
    canLogin: Maybe<boolean>;
};
