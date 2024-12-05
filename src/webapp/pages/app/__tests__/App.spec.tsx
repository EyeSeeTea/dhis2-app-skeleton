import { fireEvent, render } from "@testing-library/react";

import App from "$/webapp/pages/app/App";
import { getTestContext } from "$/utils/tests";
import { Provider } from "@dhis2/app-runtime";
import { D2Api } from "@eyeseetea/d2-api/2.36";

describe("App", () => {
    it("renders the feedback component", async () => {
        const view = getView();

        expect(await view.findByText("Send feedback")).toBeInTheDocument();
    });

    it("navigates to page", async () => {
        const view = getView();

        fireEvent.click(await view.findByText("John"));

        expect(await view.findByText("Hello John")).toBeInTheDocument();
        expect(view.asFragment()).toMatchSnapshot();
    });
});

function getView() {
    const { compositionRoot } = getTestContext();
    return render(
        <Provider config={{ baseUrl: "http://localhost:8080", apiVersion: 30 }}>
            <App api={{} as D2Api} compositionRoot={compositionRoot} />
        </Provider>
    );
}
