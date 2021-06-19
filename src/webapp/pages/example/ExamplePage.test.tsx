import { RenderResult, screen } from "@testing-library/react";
import { getReactComponent, getTestContext } from "../../../utils/tests";
import { ExamplePage } from "./ExamplePage";

const { context } = getTestContext();

function renderComponent(): RenderResult {
    return getReactComponent(<ExamplePage />, context);
}

describe("Example component", () => {
    test("renders user name", async () => {
        renderComponent();
        expect(screen.getByText("Hello John Traore")).toBeDefined();
    });
});
