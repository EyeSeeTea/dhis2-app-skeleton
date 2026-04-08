import ReactDOM from "react-dom/client";
import { Dhis2App } from "./pages/app/Dhis2App";
import { CssReset, CssVariables } from "@dhis2/ui";

const domElementId = "root";
const root = document.getElementById(domElementId);
if (!root) throw new Error(`Root DOM element not found: id=${domElementId}`);
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
