import path from "node:path";
import { TSESLint } from "@typescript-eslint/utils";
import { parser } from "typescript-eslint";
import { describe, expect, test } from "vitest";
import rule from "./rule";

describe("http-client-access", () => {
    test("reports direct HTTP without enforcing layer imports", () => {
        const messages = new TSESLint.Linter().verify(
            "import '$/data/repositories/UserD2Repository'; fetch('/api');",
            [
                {
                    files: ["**/*.ts"],
                    languageOptions: { parser },
                    plugins: { eyeseetea: { rules: { "http-client-access": rule } } },
                    rules: { "eyeseetea/http-client-access": "warn" },
                },
            ],
            { filename: path.resolve("src/domain/Probe.ts") }
        );
        expect(messages).toHaveLength(1);
        expect(messages.every(message => message.ruleId === "eyeseetea/http-client-access")).toBe(
            true
        );
    });
    test("permits repository client imports and construction", () => {
        const messages = new TSESLint.Linter().verify(
            "import { D2Api } from '@eyeseetea/d2-api'; new D2Api();",
            [
                {
                    files: ["**/*.ts"],
                    languageOptions: { parser },
                    plugins: { eyeseetea: { rules: { "http-client-access": rule } } },
                    rules: { "eyeseetea/http-client-access": "warn" },
                },
            ],
            { filename: path.resolve("src/data/repositories/Probe.ts") }
        );
        expect(messages).toHaveLength(0);
        expect(messages.every(message => message.ruleId === "eyeseetea/http-client-access")).toBe(
            true
        );
    });
});
