import { describe, expect, it } from "vitest";
import { createUser } from "./userFixtures";

describe("User", () => {
    describe("belongsToUserGroup", () => {
        it("returns true when the user is in the group", () => {
            const userGroupId = "BwyMfDBLih9";
            const user = createUser({ userGroupIds: [userGroupId] });

            expect(user.belongsToUserGroup(userGroupId)).toBe(true);
        });

        it("returns false when the user is not in the group", () => {
            const existingUserGroupId = "BwyMfDBLih9";
            const nonExistentUserGroupId = "f31IM13BgwJ";
            const user = createUser({ userGroupIds: [existingUserGroupId] });

            expect(user.belongsToUserGroup(nonExistentUserGroupId)).toBe(false);
        });

        it("returns false when the user has no groups", () => {
            const nonExistentUserGroupId = "f31IM13BgwJ";
            const user = createUser({ userGroupIds: [] });

            expect(user.belongsToUserGroup(nonExistentUserGroupId)).toBe(false);
        });
    });
});
