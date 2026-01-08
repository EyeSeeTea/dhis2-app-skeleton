import ReactDOM from "react-dom/client";
import { Buffer } from "buffer";
import { Dhis2App } from "./pages/app/Dhis2App";

// Polyfill Buffer global para compatibilidad con paquetes que lo usan directamente
if (typeof window !== "undefined" && !window.Buffer) {
    (window as any).Buffer = Buffer;
}

const domElementId = "root";
const root = document.getElementById(domElementId);
if (!root) throw new Error(`Root DOM element not found: id=${domElementId}`);
ReactDOM.createRoot(root).render(<Dhis2App />);
