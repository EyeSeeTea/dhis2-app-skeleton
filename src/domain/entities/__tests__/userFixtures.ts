import { Id } from "$/domain/entities/Ref";
import { User } from "$/domain/entities/User";

export function createAdminUser(): User {
    return createUser({ isAdmin: true });
}

export function createNonAdminUser(): User {
    return createUser({ isAdmin: false });
}

export function createUser(options: {
    id?: Id;
    name?: string;
    isAdmin?: boolean;
    userGroupIds?: Id[];
    userRoleIds?: Id[];
}): User {
    return new User({
        id: options.id ?? "kQiwoyMYHBS",
        name: options.name ?? "John Traore",
        username: "user",
        userRoleIds: options.userRoleIds ?? [],
        userGroupIds: options.userGroupIds ?? [],
        isAdmin: options.isAdmin ?? false,
    });
}
