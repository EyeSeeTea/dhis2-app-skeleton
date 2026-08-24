import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TableConfig } from "@eyeseetea/d2-ui-components";
import { Cancellation, Future } from "$/domain/entities/generic/Future";
import { Paginated } from "$/domain/entities/generic/Pagination";
import { GetRowsFuture, useObjectsTableFuture } from "$/webapp/utils/objects-table";

type Row = { id: string; name: string };

describe("useObjectsTableFuture", () => {
    it("shows the rows of the request", async () => {
        const source = createRowsSource();
        const view = renderHook(() => useObjectsTableFuture<Row>(config, source.getRows));

        act(() => source.resolveLast([{ id: "row1", name: "Row 1" }]));

        await waitFor(() =>
            expect(view.result.current.rows).toEqual([{ id: "row1", name: "Row 1" }])
        );
        expect(view.result.current.isLoading).toBe(false);
    });

    describe("when a new request is fired while another one is in flight", () => {
        it("cancels the previous request", async () => {
            const source = createRowsSource();
            const view = renderHook(() => useObjectsTableFuture<Row>(config, source.getRows));

            act(() => view.result.current.reload());

            await waitFor(() => expect(source.cancel).toHaveBeenCalledTimes(1));
        });

        it("ignores the response of the cancelled request", async () => {
            const source = createRowsSource();
            const view = renderHook(() => useObjectsTableFuture<Row>(config, source.getRows));
            const [firstRequest, secondRequest] = [0, 1];

            act(() => view.result.current.reload());
            act(() => source.resolve(secondRequest, [{ id: "new", name: "New" }]));
            act(() => source.resolve(firstRequest, [{ id: "stale", name: "Stale" }]));

            await waitFor(() =>
                expect(view.result.current.rows).toEqual([{ id: "new", name: "New" }])
            );
        });
    });

    it("cancels the request in flight on unmount", async () => {
        const source = createRowsSource();
        const view = renderHook(() => useObjectsTableFuture<Row>(config, source.getRows));

        view.unmount();

        await waitFor(() => expect(source.cancel).toHaveBeenCalledTimes(1));
    });
});

const config: TableConfig<Row> = {
    columns: [{ name: "name", text: "Name" }],
    actions: [],
    paginationOptions: { pageSizeOptions: [10], pageSizeInitialValue: 10 },
    initialSorting: { field: "name", order: "asc" },
};

/* Rows source with the resolution controlled by the test, so several requests can be kept in
   flight and resolved in any order. Cancelling rejects with a Cancellation, as a real request
   does (see apiToFuture). */
function createRowsSource() {
    const resolvers: ((rows: Row[]) => void)[] = [];
    const cancel = vi.fn();

    const getRows: GetRowsFuture<Row> = () =>
        Future.fromComputation<Error, Paginated<Row>>((resolve, reject) => {
            resolvers.push(rows =>
                resolve({
                    objects: rows,
                    pager: { page: 1, pageSize: 10, total: rows.length, pageCount: 1 },
                })
            );

            return () => {
                cancel();
                reject(new Cancellation());
            };
        });

    function resolve(index: number, rows: Row[]): void {
        const resolver = resolvers[index];
        if (!resolver) throw new Error(`No request with index ${index}`);
        resolver(rows);
    }

    return {
        getRows: getRows,
        cancel: cancel,
        resolve: resolve,
        resolveLast: (rows: Row[]) => resolve(resolvers.length - 1, rows),
    };
}
