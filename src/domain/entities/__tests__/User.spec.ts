import { describe, expect, it } from "vitest";
import { createAdminUser, createNonAdminUser, createUser } from "./userFixtures";

describe("User", () => {
    it("should be admin if isAdmin is true", () => {
        const user = createAdminUser();

        expect(user.isAdmin).toBe(true);
    });

    it("should not be admin if isAdmin is false", () => {
        const user = createNonAdminUser();

        expect(user.isAdmin).toBe(false);
    });

    it("should return belong to user group equal to true when the id exists", () => {
        const userGroupId = "BwyMfDBLih9";

        const user = createUser({ isAdmin: false, userGroupIds: [userGroupId], userRoleIds: [] });

        expect(user.belongToUserGroup(userGroupId)).toBe(true);
    });

    it("should return belong to user group equal to false when the id does not exist", () => {
        const existedUserGroupId = "BwyMfDBLih9";
        const nonExistedUserGroupId = "f31IM13BgwJ";

        const user = createUser({
            isAdmin: false,
            userGroupIds: [existedUserGroupId],
            userRoleIds: [],
        });

        expect(user.belongToUserGroup(nonExistedUserGroupId)).toBe(false);
    });

    it("should return belong to user group equal to false if user groups is empty", () => {
        const nonExistedUserGroupId = "f31IM13BgwJ";

        const user = createUser({ isAdmin: false, userGroupIds: [], userRoleIds: [] });

        expect(user.belongToUserGroup(nonExistedUserGroupId)).toBe(false);
    });
});
