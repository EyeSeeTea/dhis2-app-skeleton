import { FutureData } from "$/domain/entities/generic/Future";
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
    order: { field: "name" | "username" | "disabled"; order: "asc" | "desc" };
};

export type UsersFilters = {
    userGroupIds: Maybe<Id[]>;
    userRoleIds: Maybe<Id[]>;
    disabled: Maybe<boolean>;
};
