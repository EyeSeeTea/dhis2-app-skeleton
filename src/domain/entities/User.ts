import { Struct } from "./generic/Struct";
import { Id, NamedRef } from "./Ref";

export type UserAttrs = {
    id: Id;
    name: string;
    username: string;
    userRoles: UserRole[];
    userGroups: NamedRef[];
};

export type UserRole = {
    id: Id;
    name: string;
    authorities: string[];
};

export class User extends Struct<UserAttrs>() {
    belongToUserGroup(userGroupUid: string): boolean {
        return this.userGroups.some(({ id }) => id === userGroupUid);
    }

    isAdmin(): boolean {
        return this.userRoles.some(({ authorities }) => authorities.includes("ALL"));
    }
}
