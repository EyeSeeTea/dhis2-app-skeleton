import { Id } from "$/domain/entities/Ref";
import { User } from "$/domain/entities/User";

export function createAdminUser(): User {
    return createUser({ isAdmin: true, userGroupIds: [], userRoleIds: ["Hg7n0MwzUQn"] });
}

export function createNonAdminUser(): User {
    return createUser({ isAdmin: false, userGroupIds: [], userRoleIds: ["Hg7n0MwzUQn"] });
}

export function createUser(options: {
    isAdmin: boolean;
    userGroupIds: Id[];
    userRoleIds: Id[];
}): User {
    return new User({
        id: "kQiwoyMYHBS",
        name: "John Traore",
        username: "user",
        userRoleIds: options.userRoleIds,
        userGroupIds: options.userGroupIds,
        isAdmin: options.isAdmin,
    });
}
