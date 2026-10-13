import { TSESLint } from "@typescript-eslint/utils";
const { ESLint, Linter } = TSESLint;
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

async function policyMessages(code: string, filename: string) {
    const [result] = await new ESLint().lintText(code, { filePath: filename });
    return result!.messages;
}

// TypeScript project initialization is slower than individual checks, especially
// when application tests run concurrently. Keep this budget local to setup.
beforeAll(async () => {
    await lintMutation("export {};");
}, 20000);

describe("type assertions", () => {
    test("permits safe widening and as const but reports downcasts", async () => {
        const [result] = await eslint.lintText(
            `
            interface Animal { name: string }
            interface Dog extends Animal { bark(): void }
            declare const dog: Dog;
            declare const animal: Animal;
            const wide = dog as Animal;
            const constant = ["a", "b"] as const;
            const narrow = animal as Dog;
        `,
            { filePath: "policy-probe.ts" }
        );
        const messages = result!.messages.filter(
            message =>
                message.ruleId === "@typescript-eslint/no-unsafe-type-assertion" || message.fatal
        );
        expect(messages).toHaveLength(1);
        expect(messages[0]!.ruleId).toBe("@typescript-eslint/no-unsafe-type-assertion");
    });
});

describe("effective EyeSeeTea configuration", () => {
    test("custom rules retain their scopes and severities under the EyeSeeTea namespace", async () => {
        const eslint = new ESLint();
        for (const filename of ["src/data/api-futures.ts", "eslint/probe.ts", "probe.js"]) {
            const config = await eslint.calculateConfigForFile(filename);
            expect(config?.rules?.["eyeseetea/require-future-block-capture"]).toEqual(
                expect.arrayContaining([2])
            );
            expect(config?.plugins?.eyeseetea?.rules).toHaveProperty(
                "require-future-block-capture"
            );
            expect(config!.plugins).not.toHaveProperty("company");
            expect(config!.plugins).not.toHaveProperty("local");
            if (filename.startsWith("src/")) {
                for (const rule of [
                    "layer-dependencies",
                    "http-client-access",
                    "client-construction",
                ]) {
                    expect(config?.rules?.[`eyeseetea/${rule}`]).toEqual(
                        expect.arrayContaining([2])
                    );
                }
                expect(config?.rules?.["eyeseetea/no-collection-mutation"]).toEqual(
                    expect.arrayContaining([2])
                );
            } else {
                for (const rule of [
                    "layer-dependencies",
                    "http-client-access",
                    "client-construction",
                ]) {
                    expect(config!.rules![`eyeseetea/${rule}`]).toBeUndefined();
                }
                expect(config!.rules!["eyeseetea/no-collection-mutation"]).toBeUndefined();
            }
        }
    });
    test("baseline policy promotes styling while preserving correctness errors", async () => {
        const messages = await policyMessages(
            "import { makeStyles } from '@material-ui/core'; eval('code');",
            "src/webapp/components/share/Share.tsx"
        );
        expect(messages).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ ruleId: "no-restricted-imports", severity: 2 }),
                expect.objectContaining({ ruleId: "no-eval", severity: 2 }),
            ])
        );
    });
    test("Promise and toPromise are reported in production domain", async () => {
        const messages = await policyMessages(
            "export function probe(): Promise<number> { return Promise.resolve(1); } value.toPromise();",
            "src/domain/usecases/GetUsersUseCase.ts"
        );
        expect(messages).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ ruleId: "no-restricted-globals" }),
                expect.objectContaining({ ruleId: "no-restricted-syntax" }),
            ])
        );
    });
    test("test files can bridge Futures to Promises", async () => {
        const messages = await policyMessages(
            "const result: Promise<number> = Promise.resolve(1); value.toPromise();",
            "src/domain/usecases/__tests__/GetCurrentUserUseCase.spec.ts"
        );
        expect(
            messages.filter(message =>
                ["no-restricted-globals", "no-restricted-syntax"].includes(message.ruleId ?? "")
            )
        ).toEqual([]);
    });
    test("async callbacks inside Future.block are permitted", async () => {
        const messages = await policyMessages(
            "Future.block(async capture => await capture(value));",
            "src/domain/usecases/GetUsersUseCase.ts"
        );
        expect(
            messages.filter(message =>
                [
                    "no-restricted-globals",
                    "no-restricted-syntax",
                    "eyeseetea/require-future-block-capture",
                ].includes(message.ruleId ?? "")
            )
        ).toEqual([]);
    });
    test("accessible E2E queries pass while CSS and test IDs fail", async () => {
        const config = await new ESLint().calculateConfigForFile(
            "src/tests/playwright/probe.e2e.ts"
        );
        const result = new Linter().verify(
            "page.getByRole('button'); page.locator('.button'); page.getByTestId('submit'); page.$('.button'); page.$$('.button');",
            [
                {
                    languageOptions: { parser },
                    rules: { "no-restricted-syntax": config!.rules!["no-restricted-syntax"] },
                },
            ]
        );
        expect(result).toHaveLength(4);
        expect(result.every(message => message.severity === 2)).toBe(true);
    });
});
