import type { TSESLint } from "@typescript-eslint/utils";
import architecture from "./rules/architecture/rule.ts";
import noCollectionMutation from "./rules/no-collection-mutation/rule.ts";
import requireFutureBlockCapture from "./rules/require-future-block-capture/rule.ts";

export default {
    rules: {
        architecture,
        "no-collection-mutation": noCollectionMutation,
        "require-future-block-capture": requireFutureBlockCapture,
    },
} satisfies TSESLint.FlatConfig.Plugin;
