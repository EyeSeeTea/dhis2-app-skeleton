import { getReactComponent } from "$/utils/tests";
import { ExamplePage } from "$/webapp/pages/example/ExamplePage";

describe("ExamplePage", () => {
    it("renders the feedback component", async () => {
        const view = getView();

        expect(await view.findByText("Hello Mary")).toBeInTheDocument();
        expect(view.asFragment()).toMatchSnapshot();
    });
});

function getView() {
    return getReactComponent(<ExamplePage name="Mary" />);
}
