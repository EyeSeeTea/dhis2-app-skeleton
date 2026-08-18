import ReactDOM from "react-dom/client";
import { Dhis2App } from "./pages/app/Dhis2App";
import { assertValue } from "$/utils/assert";

const domElementId = "root";
const root = assertValue(
    document.getElementById(domElementId),
    `Root DOM element not found: id=${domElementId}`
);

ReactDOM.createRoot(root).render(<Dhis2App />);
