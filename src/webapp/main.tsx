import ReactDOM from "react-dom/client";
import { Dhis2App } from "./pages/app/Dhis2App";

const domElementId = "root";
const root = document.getElementById(domElementId);
if (!root) throw new Error(`Root DOM element not found: id=${domElementId}`);
ReactDOM.createRoot(root).render(<Dhis2App />);
