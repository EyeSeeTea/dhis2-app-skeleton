import { createArchitectureRule } from "./shared.ts";
export type { ArchitectureOptions } from "./shared.ts";

// Compatibility wrapper for configurations that enable the original combined rule.
export default createArchitectureRule(
    "architecture",
    "Check Clean Architecture dependency directions and DHIS2 client boundaries."
);
