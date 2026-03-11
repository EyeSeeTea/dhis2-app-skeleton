import { getReactComponent } from "$/utils/tests";
import { ExamplePage } from "$/webapp/pages/example/ExamplePage";
import { RenderResult } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import prettier from "prettier";

describe("ExamplePage", () => {
    // Snapshot testing verifies rendered HTML structure rather than specific  behaviour
    // or interactions. This approach is very useful when refactoring code while ensuring
    // that the output remains intact.
    it("renders the component", async () => {
        const view = getView();

        expect(await view.findByText("Hello Mary")).toBeInTheDocument();
        expect(await getHtml(view)).toMatchSnapshot();
    });

    // We can also have more specific tests that verify the behaviour of the component,
    // such as checking if the name is rendered correctly.
    it("renders the person name as a heading", async () => {
        const view = getView();

        expect(await view.findByRole("heading", { name: "Hello Mary" })).toBeInTheDocument();
    });
});

function getView() {
    return getReactComponent(<ExamplePage name="Mary" />);
}

// Get html and remove dynamic attributes (like class names) to make snapshot stable
function getHtml(view: RenderResult): Promise<string> {
    const container = document.createElement("div");
    container.append(view.asFragment().cloneNode(true));
    const html = container.innerHTML.replace(/\sclass="[^"]*"/g, "");
    return prettier.format(html, { parser: "html" });
}
