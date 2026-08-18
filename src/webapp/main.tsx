import ReactDOM from "react-dom/client";
import { Dhis2App } from "./pages/app/Dhis2App";
import { CssReset, CssVariables } from "@dhis2/ui";
import { assertValue } from "$/utils/assert";

const domElementId = "root";
const root = assertValue(
    document.getElementById(domElementId),
    `Root DOM element not found: id=${domElementId}`
);

ReactDOM.createRoot(root).render(
    <AppWrapper>
        <Dhis2App />
    </AppWrapper>
);

function AppWrapper(props: { children: React.ReactNode }) {
    return (
        <>
            <CssReset />
            <CssVariables theme spacers colors />
            {props.children}
        </>
    );
}
