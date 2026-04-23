import { Id } from "$/domain/entities/Ref";
import { User } from "$/domain/entities/User";

export function createAdminUser(): User {
    return createUser({ isAdmin: true, userRoleIds: ["Hg7n0MwzUQn"] });
}

export function createNonAdminUser(): User {
    return createUser({ isAdmin: false, userRoleIds: ["Hg7n0MwzUQn"] });
}

export function createUserWithGroups(userGroupIds: Id[] = []): User {
    return new User({
        id: "YjJdEO6d38H",
        name: "John Traore",
        username: "user",
        userRoleIds: [],
        userGroupIds: userGroupIds,
        isAdmin: false,
    });
}

function createUser(options: { isAdmin: boolean; userRoleIds: Id[] }): User {
    return new User({
        id: "kQiwoyMYHBS",
        name: "John Traore",
        username: "user",
        userRoleIds: options.userRoleIds,
        userGroupIds: [],
        isAdmin: options.isAdmin,
    });
}
