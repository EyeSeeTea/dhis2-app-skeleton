import React from "react";
import { render, fireEvent, waitForDomChange } from "@testing-library/react";
import { SnackbarProvider } from "d2-ui-components";
import "@testing-library/jest-dom/extend-expect";

import Example from "../Example";
import { getMockApi } from "d2-api";
import { ApiContext } from "../../../contexts/api-context";

const { api, mock } = getMockApi();

function getComponent({ name = "Some Name" } = {}) {
    return render(
        <ApiContext.Provider value={api}>
            <SnackbarProvider>
                <Example name={name} />
            </SnackbarProvider>
        </ApiContext.Provider>
    );
}

describe("Example", () => {
    beforeEach(() => {
        mock.onGet("/dataSets", { params: { fields: "id", pageSize: 5 } }).reply(200, {
            pager: {
                page: 1,
                pageCount: 3,
                total: 12,
                pageSize: 5,
            },
            dataSets: [{ id: "1234a" }, { id: "1234b" }],
        });
    });

    test("greeting", async () => {
        const component = getComponent();
        // Use component.debug() to see its full HTML
        expect(component.queryByText("Hello Some Name!")).toBeInTheDocument();
    });

    test("dataset IDS", async () => {
        const component = getComponent();
        await waitForDomChange();
        expect(component.queryByText("1234a, 1234b", { exact: false })).toBeInTheDocument();
    });

    test("increment button", async () => {
        const component = getComponent();
        expect(component.queryByText("Value=0")).toBeInTheDocument();
        fireEvent.click(component.getByText("+1"));
        expect(component.queryByText("Value=1")).toBeInTheDocument();
    });

    test("feedback button", async () => {
        const component = getComponent();
        fireEvent.click(component.getByText("Click to show feedback"));
        expect(component.queryByText("Some info")).toBeInTheDocument();
    });
});
