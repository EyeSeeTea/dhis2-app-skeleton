import { Struct } from "./generic/Struct";
import { Id } from "./Ref";

export type UserRoleAttrs = {
    id: Id;
    name: string;
    authorities: string[];
};

export class UserRole extends Struct<UserRoleAttrs>() {
    hasAuthority(authority: string): boolean {
        return this.authorities.includes(authority);
    }
}
