import { Linter } from "eslint";
import { describe, expect, test } from "vitest";

// @ts-expect-error Local CommonJS rule has no TypeScript declaration.
import requireFutureBlockCapture from "./require-future-block-capture.js";

function lint(source: string) {
    const linter = new Linter({ configType: "eslintrc" });
    linter.defineRule("require-future-block-capture", requireFutureBlockCapture);

    return linter.verifyAndFix(source, {
        parserOptions: { ecmaVersion: 2022, sourceType: "module" },
        rules: { "require-future-block-capture": "error" },
    });
}

describe("require-future-block-capture", () => {
    test("allows Futures captured in Future.block", () => {
        const result = lint("Future.block(async $ => await $(Future.success(1))); ");

        expect(result.messages).toEqual([]);
    });

    test("allows Futures captured in Future.block_", () => {
        const result = lint("Future.block_()(async capture => await capture(Future.success(1))); ");

        expect(result.messages).toEqual([]);
    });

    test("reports but does not rewrite a native Promise", () => {
        const source = "Future.block(async $ => await Promise.resolve(1));";
        const result = lint(source);

        expect(result.output).toBe(source);
        expect(result.messages).toMatchObject([{ messageId: "wrapAwait" }]);
    });

    test("does not report awaits in nested function declarations", () => {
        const source = `
            Future.block(async $ => {
                async function helper() {
                    await fetch(url);
                }

                return $(Future.fromPromise(helper()));
            });
        `;

        expect(lint(source).messages).toEqual([]);
    });

    test("does not report awaits in nested arrow functions", () => {
        const source = `
            Future.block(async $ => {
                const helper = async () => {
                    await fetch(url);
                };

                return $(Future.fromPromise(helper()));
            });
        `;

        expect(lint(source).messages).toEqual([]);
    });

    test("reports awaits when the callback has no capture parameter", () => {
        const result = lint("Future.block(async () => await Promise.resolve(1));");

        expect(result.messages).toMatchObject([{ messageId: "wrapAwait" }]);
    });

    test("reports awaits when the callback destructures its capture parameter", () => {
        const result = lint("Future.block(async ({ length }) => await Promise.resolve(length));");

        expect(result.messages).toMatchObject([{ messageId: "wrapAwait" }]);
    });
});
