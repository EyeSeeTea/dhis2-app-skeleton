import { Id } from "./Base";

export interface User {
    id: Id;
    name: string;
    username: string;
    organisationUnits: OrganisationUnit[];
    userRoles: UserRole[];
}

interface UserRole {
    id: Id;
    name: string;
}

interface OrganisationUnit {
    id: string;
    path: string;
    level: number;
}
