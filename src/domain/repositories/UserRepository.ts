import { FutureData } from "$/data/api-futures";
import { PaginatedResponse } from "$/domain/entities/generic/Pagination";
import { Id } from "$/domain/entities/Ref";
import { User } from "$/domain/entities/User";
import { Maybe } from "$/utils/ts-utils";

export interface UserRepository {
    getCurrent(): FutureData<User>;
    get(options: GetUsersOptions): FutureData<PaginatedResponse<User>>;
}

export interface GetUsersOptions {
    search: string;
    page: number;
    pageSize: number;
    filters: UsersFilters;
}

export interface UsersFilters {
    userGroupIds: Maybe<Id[]>;
    userRoleIds: Maybe<Id[]>;
    canLogin: Maybe<boolean>;
}
