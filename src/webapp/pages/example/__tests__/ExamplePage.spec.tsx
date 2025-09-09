import { getReactComponent } from "$/utils/tests";
import { ExamplePage } from "$/webapp/pages/example/ExamplePage";
import { describe, expect, it } from "vitest";

/* Note: React tests are much slower than regular unit tests, so only add them when they add value */

describe("ExamplePage", () => {
    it("renders the feedback component", async () => {
        const page = getPage();

        expect(await page.findByText("Hello Mary")).toBeInTheDocument();
        expect(page.asFragment()).toMatchSnapshot();
    });
});

function getPage() {
    return getReactComponent(<ExamplePage name="Mary" />);
}
