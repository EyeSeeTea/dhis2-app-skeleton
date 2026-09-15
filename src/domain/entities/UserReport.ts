import { User } from "./User";
import { UserRole } from "./UserRole";

export type RoleSummary = {
    role: UserRole;
    userCount: number;
};

export type UserReport = {
    totalUsers: number;
    adminCount: number;
    nonAdminCount: number;
    usersWithMultipleRoles: User[];
    rolesSortedByUsage: RoleSummary[];
    uniqueAuthorities: string[];
};
