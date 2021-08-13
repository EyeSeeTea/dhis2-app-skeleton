import _ from "lodash";
import { NamedRef } from "./Ref";

export interface User {
    id: string;
    name: string;
    username: string;
    userRoles: UserRole[];
    userGroups: NamedRef[];
}

export interface UserRole extends NamedRef {
    authorities: string[];
}

export const isSuperAdmin = (user: User): boolean => {
    return _.some(user.userRoles, ({ authorities }) => authorities.includes("ALL"));
};
