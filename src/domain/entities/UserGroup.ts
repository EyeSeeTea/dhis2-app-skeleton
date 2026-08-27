import { Struct } from "./generic/Struct";
import { Id } from "./Ref";

export type UserGroupAttrs = {
    id: Id;
    name: string;
};

export class UserGroup extends Struct<UserGroupAttrs>() {}
