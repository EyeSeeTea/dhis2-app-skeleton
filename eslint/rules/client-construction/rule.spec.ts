import path from "node:path";
import { TSESLint } from "@typescript-eslint/utils";
import { parser } from "typescript-eslint";
import { describe, expect, test } from "vitest";
import rule from "./rule";

describe("client-construction", () => {
    test("reports construction without enforcing layer imports or HTTP access", () => {
        const messages = new TSESLint.Linter().verify(
            "import '$/data/repositories/UserD2Repository'; import { D2Api } from '@eyeseetea/d2-api'; new D2Api(); fetch('/api');",
            [
                {
                    files: ["**/*.ts"],
                    languageOptions: { parser },
                    plugins: { eyeseetea: { rules: { "client-construction": rule } } },
                    rules: { "eyeseetea/client-construction": "warn" },
                },
            ],
            { filename: path.resolve("src/domain/Probe.ts") }
        );
        expect(messages).toHaveLength(1);
        expect(messages.every(message => message.ruleId === "eyeseetea/client-construction")).toBe(
            true
        );
    });
    test("permits construction in the default factory", () => {
        const messages = new TSESLint.Linter().verify(
            "import { D2Api } from '@eyeseetea/d2-api'; const getWebappCompositionRoot = () => new D2Api();",
            [
                {
                    files: ["**/*.ts"],
                    languageOptions: { parser },
                    plugins: { eyeseetea: { rules: { "client-construction": rule } } },
                    rules: { "eyeseetea/client-construction": "warn" },
                },
            ],
            { filename: path.resolve("src/CompositionRoot.ts") }
        );
        expect(messages).toHaveLength(0);
        expect(messages.every(message => message.ruleId === "eyeseetea/client-construction")).toBe(
            true
        );
    });
});
