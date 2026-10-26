import path from "node:path";
import { expect, test } from "vitest";

import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
const require = createRequire(path.join(globalThis.process.cwd(), "package.json"));
const cli = path.join(path.dirname(require.resolve("eslint/package.json")), "bin/eslint.js");
const { scripts } = JSON.parse(
    readFileSync(path.join(globalThis.process.cwd(), "package.json"), "utf8")
);

test("native baseline commands enforce accepted counts and prune resolved debt", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "eslint-baseline-"));
    const write = (filename, content) => writeFileSync(path.join(cwd, filename), content);
    const run = name => {
        const [executable, ...args] = scripts[name].split(/\s+/);
        expect(executable).toBe("eslint");
        const result = spawnSync(globalThis.process.execPath, [cli, ...args], {
            cwd,
            encoding: "utf8",
        });
        if (result.error) throw result.error;
        return result;
    };
    try {
        mkdirSync(path.join(cwd, "src"));
        mkdirSync(path.join(cwd, "eslint"));
        write("eslint/empty-suppressions.json", "{}\n");
        write("eslint.config.mjs", 'export default [{ rules: { "no-var": "error" } }];\n');
        write("src/legacy.js", "var legacy = 1;\n");

        // A missing committed baseline must fail rather than disable enforcement.
        expect(run("lint:new").status).toBe(2);
        expect(run("lint:baseline").status).toBe(0);
        const baseline = readFileSync(path.join(cwd, "eslint-suppressions.json"), "utf8");
        expect(JSON.parse(baseline)["src/legacy.js"]["no-var"].count).toBe(1);
        expect(run("lint:new").status).toBe(0);
        expect(run("lint:all").status).toBe(1);
        expect(readFileSync(path.join(cwd, "eslint-suppressions.json"), "utf8")).toBe(baseline);

        write("src/legacy.js", "var legacy = 1; var additional = 2;\n");
        expect(run("lint:new").status).toBe(1);
        expect(run("lint:baseline:prune").status).toBe(1);
        expect(readFileSync(path.join(cwd, "eslint-suppressions.json"), "utf8")).toBe(baseline);

        // Native matching is intentionally by count, not by violation identity.
        write("src/legacy.js", "var replacement = 2;\n");
        expect(run("lint:new").status).toBe(0);
        write("src/new.js", "var introduced = 3;\n");
        expect(run("lint:new").status).toBe(1);
        write("src/new.js", "const introduced = 3;\n");
        write("src/legacy.js", "const replacement = 2;\n");
        expect(run("lint:new").status).toBe(2);
        expect(run("lint:baseline:prune").status).toBe(0);
        expect(
            JSON.parse(readFileSync(path.join(cwd, "eslint-suppressions.json"), "utf8"))
        ).toEqual({});
        expect(run("lint:new").status).toBe(0);
    } finally {
        rmSync(cwd, { recursive: true, force: true });
    }
}, 20000);
