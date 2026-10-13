import { createArchitectureRule } from "../shared/architecture.ts";

export default createArchitectureRule(
    "client-construction",
    "Restrict D2Api construction to configured composition-root factories.",
    "clientConstruction"
);
