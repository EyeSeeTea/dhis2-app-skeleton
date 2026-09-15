import { afterEach, describe, expect, it, vi } from "vitest";
import { UserTestRepository } from "$/data/repositories/UserTestRepository";
import { Future } from "$/domain/entities/generic/Future";
import { createUser } from "$/domain/entities/__tests__/userFixtures";
import { User } from "$/domain/entities/User";
import { Paginated } from "$/domain/entities/generic/Pagination";
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

    it("elides the groups that do not fit in the cell, showing them all as its tooltip", async () => {
        const user = createUser({ id: "user1", userGroupIds: ["g1", "g2", "g3", "g4"] });
        mockUsers([user]);

        const view = getReactComponent(<UsersTable />);
        const cell = await view.findByText(/\(\+1 more\)/);

        expect(cell.textContent).toBe("g1, g2, g3 (+1 more)");
        expect(cell.getAttribute("title")).toBe("g1, g2, g3, g4");
    });
});

function mockUsers(users: User[]): void {
    vi.spyOn(UserTestRepository.prototype, "get").mockImplementation(() =>
        Future.success<Error, Paginated<User>>({
            pager: { page: 1, pageSize: 25, total: users.length, pageCount: 1 },
            objects: users,
        })
    );
}

function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
