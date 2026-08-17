import { afterEach, describe, expect, it, vi } from "vitest";
import { UserTestRepository } from "$/data/repositories/UserTestRepository";
import { getReactComponent } from "$/utils/tests";
import { UsersTable } from "$/webapp/components/users-table/UsersTable";

describe("UsersTable", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("renders the users returned by the repository", async () => {
        const view = getReactComponent(<UsersTable />);

        const rows = await view.findAllByText("John Traore");

        expect(rows).toHaveLength(3);
    });

    /* The table config is rebuilt whenever the rows change, as the row actions use them. Since
       useObjectsTable reloads on some config changes, that can turn into an endless loop. */
    it("requests the users only once", async () => {
        const getUsers = vi.spyOn(UserTestRepository.prototype, "get");
        const view = getReactComponent(<UsersTable />);

        await view.findAllByText("John Traore");
        await wait(100);

        expect(getUsers).toHaveBeenCalledTimes(1);
    });
});

function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
