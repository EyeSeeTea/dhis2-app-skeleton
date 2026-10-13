import { createArchitectureRule } from "../architecture/shared.ts";

export default createArchitectureRule(
    "layer-dependencies",
    "Check dependency directions between application layers.",
    "layerDependencies"
);
