import { Struct } from "./generic/Struct";
import { Id } from "./Ref";

export type UserAttrs = {
    id: Id;
    name: string;
    username: string;
    userRoleIds: Id[];
    userGroupIds: Id[];
    isAdmin: boolean;
};

export class User extends Struct<UserAttrs>() {
    belongToUserGroup(userGroupUid: Id): boolean {
        return this.userGroupIds.includes(userGroupUid);
    }
}
