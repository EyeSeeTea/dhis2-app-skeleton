import { createArchitectureRule } from "../shared/architecture.ts";

export default createArchitectureRule(
    "layer-dependencies",
    "Check dependency directions between application layers.",
    "layerDependencies"
);
