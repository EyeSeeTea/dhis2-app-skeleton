import { getTestCompositionRoot } from "$/CompositionRoot";

describe("GetCurrentUserUseCase", () => {
    it("returns user", async () => {
        const compositionRoot = getTestCompositionRoot();

        const res = compositionRoot.users.getCurrent.execute();
        const user = await res.toPromise();
        expect(user.name).toEqual("John Traore");
    });
});
