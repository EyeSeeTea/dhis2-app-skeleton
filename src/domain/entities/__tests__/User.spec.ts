import { describe, expect, it } from "vitest";
import { createAdminUser, createNonAdminUser, createUserWithGroups } from "./userFixtures";

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

        const user = createUserWithGroups([userGroupId]);

        expect(user.belongToUserGroup(userGroupId)).toBe(true);
    });

    it("should return belong to user group equal to false when the id does not exist", () => {
        const existedUserGroupId = "BwyMfDBLih9";
        const nonExistedUserGroupId = "f31IM13BgwJ";

        const user = createUserWithGroups([existedUserGroupId]);

        expect(user.belongToUserGroup(nonExistedUserGroupId)).toBe(false);
    });

    it("should return belong to user group equal to false if user groups is empty", () => {
        const nonExistedUserGroupId = "f31IM13BgwJ";

        const user = createUserWithGroups();

        expect(user.belongToUserGroup(nonExistedUserGroupId)).toBe(false);
    });
});
