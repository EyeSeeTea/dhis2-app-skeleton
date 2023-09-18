import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { CompositionRoot } from "../../../../CompositionRoot";

import App from "../App";

declare const compositionRoot: CompositionRoot;

describe("App", () => {
    it("renders components", async () => {
        //act(() => routes.counter({ id: "1" }).push());
        //const compositionRoot = await getProxiedCompositionRoot();
        const view = render(<App compositionRoot={compositionRoot} />);

        expect(view.getByText("Current user:")).toBeInTheDocument();
        await waitFor(() => expect(view.getByText("John")));
        fireEvent.click(view.getByText("John"));

        expect(view.asFragment()).toMatchSnapshot();
    });
});
