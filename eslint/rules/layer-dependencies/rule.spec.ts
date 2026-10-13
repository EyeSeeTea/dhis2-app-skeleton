import path from "node:path";
import { TSESLint } from "@typescript-eslint/utils";
import { parser } from "typescript-eslint";
import { describe, expect, test } from "vitest";
import rule from "./rule";

describe("layer-dependencies", () => {
    test("reports layer imports without enforcing client access", () => {
        const messages = new TSESLint.Linter().verify(
            "import '$/data/repositories/UserD2Repository'; fetch('/api'); import { D2Api } from '@eyeseetea/d2-api'; new D2Api();",
            [
                {
                    files: ["**/*.ts"],
                    languageOptions: { parser },
                    plugins: { eyeseetea: { rules: { "layer-dependencies": rule } } },
                    rules: { "eyeseetea/layer-dependencies": "warn" },
                },
            ],
            { filename: path.resolve("src/domain/Probe.ts") }
        );
        expect(messages).toHaveLength(1);
        expect(messages.every(message => message.ruleId === "eyeseetea/layer-dependencies")).toBe(
            true
        );
    });
    test("does not enforce client construction in repositories", () => {
        const messages = new TSESLint.Linter().verify(
            "import { D2Api } from '@eyeseetea/d2-api'; new D2Api();",
            [
                {
                    files: ["**/*.ts"],
                    languageOptions: { parser },
                    plugins: { eyeseetea: { rules: { "layer-dependencies": rule } } },
                    rules: { "eyeseetea/layer-dependencies": "warn" },
                },
            ],
            { filename: path.resolve("src/data/repositories/Probe.ts") }
        );
        expect(messages).toHaveLength(0);
        expect(messages.every(message => message.ruleId === "eyeseetea/layer-dependencies")).toBe(
            true
        );
    });
});
