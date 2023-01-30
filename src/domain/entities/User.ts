import { NamedRef } from "./Ref";

export interface UserData {
    id: string;
    name: string;
    username: string;
    userRoles: UserRole[];
    userGroups: NamedRef[];
}

export interface UserRole extends NamedRef {
    authorities: string[];
}

export class User {
    public readonly id: string;
    public readonly name: string;
    public readonly username: string;

    private readonly userGroups: NamedRef[];
    private readonly userRoles: UserRole[];

    constructor(data: UserData) {
        this.id = data.id;
        this.name = data.name;
        this.username = data.username;
        this.userRoles = data.userRoles;
        this.userGroups = data.userGroups;
    }

    belongToUserGroup(userGroupUid: string): boolean {
        return this.userGroups.some(({ id }) => id === userGroupUid);
    }

    isAdmin(): boolean {
        return this.userRoles.some(({ authorities }) => authorities.includes("ALL"));
    }
}
