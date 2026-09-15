import { describe, expect, it } from "vitest";
import { Id } from "$/domain/entities/Ref";
import { UserGroup } from "$/domain/entities/UserGroup";
import { UserRole } from "$/domain/entities/UserRole";
import { createUser } from "$/domain/entities/__tests__/userFixtures";
import { UserView } from "$/webapp/components/users-table/UserView";

describe("UserView", () => {
    describe("renderUserGroups", () => {
        it("returns the names of the groups of the user, comma-separated", () => {
            const userView = createUserView();
            const user = createUser({ userGroupIds: ["group1", "group3"] });

            expect(userView.renderUserGroups(user)).toBe("Group 1, Group 3");
        });

        it("returns an empty string when the user has no groups", () => {
            const userView = createUserView();

            expect(userView.renderUserGroups(createUser({ userGroupIds: [] }))).toBe("");
        });

        it("returns the id of the groups that are not known", () => {
            const userView = createUserView();
            const user = createUser({ userGroupIds: ["group1", "unknownGroup"] });

            expect(userView.renderUserGroups(user)).toBe("Group 1, unknownGroup");
        });

        describe("with an ellipsis option", () => {
            it("shows all the names when there are no more than the maximum", () => {
                const userView = createUserView();
                const user = createUser({ userGroupIds: ["group1", "group2"] });

                expect(userView.renderUserGroups(user, { ellipsis: 2 })).toBe("Group 1, Group 2");
            });

            it("shows the first names and the count of the remaining ones", () => {
                const userView = createUserView();
                const user = createUser({ userGroupIds: ["group1", "group2", "group3"] });

                expect(userView.renderUserGroups(user, { ellipsis: 1 })).toBe("Group 1 (+2 more)");
            });
        });
    });

    describe("renderUserRoles", () => {
        it("returns the names of the roles of the user, comma-separated", () => {
            const userView = createUserView();
            const user = createUser({ userRoleIds: ["role1", "role2"] });

            expect(userView.renderUserRoles(user)).toBe("Role 1, Role 2");
        });

        it("shows the first names and the count of the remaining ones", () => {
            const userView = createUserView();
            const user = createUser({ userRoleIds: ["role1", "role2"] });

            expect(userView.renderUserRoles(user, { ellipsis: 1 })).toBe("Role 1 (+1 more)");
        });
    });
});

function createUserView(): UserView {
    return new UserView({
        userGroups: [
            createUserGroup("group1", "Group 1"),
            createUserGroup("group2", "Group 2"),
            createUserGroup("group3", "Group 3"),
        ],
        userRoles: [createUserRole("role1", "Role 1"), createUserRole("role2", "Role 2")],
    });
}

function createUserGroup(id: Id, name: string): UserGroup {
    return new UserGroup({ id: id, name: name });
}

function createUserRole(id: Id, name: string): UserRole {
    return new UserRole({ id: id, name: name, authorities: [] });
}
