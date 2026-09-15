import { getTestCompositionRoot } from "$/CompositionRoot";
import { describe, expect, it } from "vitest";

describe("GetCurrentUserUseCase", () => {
    it("returns user", async () => {
        const compositionRoot = getTestCompositionRoot();

        const user = await compositionRoot.users.getCurrent.execute().toPromise();
        expect(user.name).toBe("John Traore");
    });
});
