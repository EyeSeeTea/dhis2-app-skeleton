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
                `
                const xs = [1];
                xs.push(2);
                xs['sort']();
                const map = new Map<string, number>();
                map.set('a', 1);
                const set = new Set<number>();
                set.add(1);
                `
            )
        ).toHaveLength(4);
    });
    test.each([
        "export function mutate<T extends number[]>(xs: T) { xs.push(1); }",
        "export function mutate<T extends [number]>(xs: T) { xs['sort'](); }",
        "export function mutate<T extends Map<string, number>>(xs: T) { xs.set('a', 1); }",
        "export function mutate<T extends Set<number>>(xs: T) { xs.add(1); }",
        "export function mutate<T extends number[] | Set<number>>(xs: T) { if (Array.isArray(xs)) xs.push(1); else xs.add(1); }",
    ])("detects constrained generic collection mutation: %s", async code => {
        const messages = await lintMutation(code);
        expect(messages).toHaveLength(code.includes("Array.isArray") ? 2 : 1);
        expect(
            messages.every(message => message.ruleId === "eyeseetea/no-collection-mutation")
        ).toBe(true);
    });
    test("allows custom mutator names on constrained generic types", async () => {
        expect(
            await lintMutation(
                "export function use<T extends { push(value: number): number; set(value: number): number }>(custom: T) { custom.push(1); custom.set(1); }"
            )
        ).toEqual([]);
    });
    test("allows immutable transformations and unrelated method names", async () => {
        expect(
            await lintMutation(
                "const xs = [1]; const ys = xs.map(x => x + 1); const queue = { push(value: number) { return value; } }; queue.push(2);"
            )
        ).toEqual([]);
    });
});
