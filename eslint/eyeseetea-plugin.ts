import type { TSESLint } from "@typescript-eslint/utils";
import layerDependencies from "./rules/layer-dependencies/rule.ts";
import httpClientAccess from "./rules/http-client-access/rule.ts";
import clientConstruction from "./rules/client-construction/rule.ts";
import architecture from "./rules/architecture/rule.ts";
import noCollectionMutation from "./rules/no-collection-mutation/rule.ts";
import requireFutureBlockCapture from "./rules/require-future-block-capture/rule.ts";

export default {
    rules: {
        architecture,
        "layer-dependencies": layerDependencies,
        "http-client-access": httpClientAccess,
        "client-construction": clientConstruction,
        "no-collection-mutation": noCollectionMutation,
        "require-future-block-capture": requireFutureBlockCapture,
    },
} satisfies TSESLint.FlatConfig.Plugin;
