import { createArchitectureRule } from "../architecture/shared.ts";

export default createArchitectureRule(
    "client-construction",
    "Restrict D2Api construction to configured composition-root factories.",
    "clientConstruction"
);
