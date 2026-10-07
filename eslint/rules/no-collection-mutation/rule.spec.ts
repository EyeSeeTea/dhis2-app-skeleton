import { TSESLint } from "@typescript-eslint/utils";
const { ESLint } = TSESLint;
import { parser } from "typescript-eslint";
import { beforeAll, describe, expect, test } from "vitest";

const eslint = new ESLint({
    overrideConfig: [
        {
            files: ["policy-probe.ts"],
            languageOptions: {
                parser,
                parserOptions: {
                    project: null,
                    projectService: { allowDefaultProject: ["policy-probe.ts"] },
                },
            },
            rules: {
                "eyeseetea/no-collection-mutation": "warn",
                "@typescript-eslint/no-unsafe-type-assertion": "warn",
            },
        },
    ],
});

async function lintMutation(code: string) {
    const [result] = await eslint.lintText(code, { filePath: "policy-probe.ts" });
    return result!.messages.filter(
        message => message.ruleId === "eyeseetea/no-collection-mutation" || message.fatal
    );
}

beforeAll(async () => {
    await lintMutation("export {};");
}, 20000);

describe("collection mutation", () => {
    test("detects typed array, Map, and Set mutation including computed access", async () => {
        expect(
            await lintMutation(
                "const xs = [1]; xs.push(2); xs['sort'](); const map = new Map<string, number>(); map.set('a', 1); const set = new Set<number>(); set.add(1);"
            )
        ).toHaveLength(4);
    });
    test("allows immutable transformations and unrelated method names", async () => {
        expect(
            await lintMutation(
                "const xs = [1]; const ys = xs.map(x => x + 1); const queue = { push(value: number) { return value; } }; queue.push(2);"
            )
        ).toEqual([]);
    });
});
