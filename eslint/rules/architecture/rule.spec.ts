import path from "node:path";
// Access real Node modules because the app build aliases stdlib imports to browser shims.
const fs = globalThis.process.getBuiltinModule("fs");
const os = globalThis.process.getBuiltinModule("os");
import { TSESLint } from "@typescript-eslint/utils";
const { Linter } = TSESLint;
import { parser } from "typescript-eslint";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import type { ArchitectureOptions } from "./rule";
import plugin from "../../eyeseetea-plugin.ts";

function lintArchitecture(
    code: string,
    filename = "src/domain/entities/PolicyProbe.ts",
    options: ArchitectureOptions = {},
    cwd = globalThis.process.cwd(),
    independent = false
) {
    return new Linter({ cwd }).verify(
        code,
        [
            {
                files: ["**/*.ts"],
                languageOptions: { parser },
                plugins: { eyeseetea: plugin },
                rules: independent
                    ? {
                          "eyeseetea/layer-dependencies": [
                              options.checks?.layerDependencies === false ? "off" : "warn",
                              { ...(options.paths ? { paths: options.paths } : {}) },
                          ],
                          "eyeseetea/http-client-access": [
                              options.checks?.httpClientAccess === false ? "off" : "warn",
                              { ...(options.paths ? { paths: options.paths } : {}) },
                          ],
                          "eyeseetea/client-construction": [
                              options.checks?.clientConstruction === false ? "off" : "warn",
                              {
                                  ...(options.paths ? { paths: options.paths } : {}),
                                  ...(options.clientFactories
                                      ? { clientFactories: options.clientFactories }
                                      : {}),
                              },
                          ],
                      }
                    : { "eyeseetea/architecture": ["warn", options] },
            },
        ],
        { filename: path.resolve(cwd, filename) }
    );
}

describe("EyeSeeTea architecture", () => {
    test.each([
        "import { UserD2Repository } from '$/data/repositories/UserD2Repository';",
        "export { UserD2Repository } from '../../data/repositories/UserD2Repository';",
        "const repository = import('$/data/repositories/UserD2Repository');",
        "const repository = require('$/data/repositories/UserD2Repository');",
        "import type { D2Api } from '$/types/d2-api';",
        "import React from 'react';",
        'window.location; document.title; fetch("/api");',
    ])("reports infrastructure in domain: %s", code => {
        expect(lintArchitecture(code).length).toBeGreaterThan(0);
    });
    test("allows domain dependencies and shadowed platform names", () => {
        expect(
            lintArchitecture(
                "import type { User } from './User'; function f(fetch: () => void) { fetch(); }"
            )
        ).toEqual([]);
    });
    test.each(["axios", "node-fetch", "cross-fetch", "undici", "got", "ky"])(
        "reports HTTP client imports in domain: %s",
        source => {
            for (const module of [source, `${source}/client`]) {
                expect(lintArchitecture(`import client from '${module}';`)).toHaveLength(1);
            }
        }
    );
    test("reports data depending on UI", () => {
        expect(
            lintArchitecture(
                "import { App } from '$/webapp/pages/app/App';",
                "src/data/PolicyProbe.ts"
            )
        ).toHaveLength(1);
    });
    test("reports presentation depending on concrete repositories", () => {
        expect(
            lintArchitecture(
                "import { UserD2Repository } from '$/data/repositories/UserD2Repository';",
                "src/webapp/PolicyProbe.ts"
            )
        ).toHaveLength(1);
    });
    test("allows repository API imports, but rejects direct HTTP", () => {
        expect(
            lintArchitecture(
                "import { D2Api } from '$/types/d2-api';",
                "src/data/repositories/PolicyProbe.ts"
            )
        ).toEqual([]);
        expect(
            lintArchitecture(
                "import axios from 'axios'; fetch('/api');",
                "src/data/repositories/PolicyProbe.ts"
            )
        ).toHaveLength(2);
    });
    test("checks aliased D2Api construction", () => {
        const code = "import { D2Api as Client } from '$/types/d2-api'; new Client();";
        expect(lintArchitecture(code, "src/CompositionRoot.ts")).toHaveLength(1);
        expect(
            lintArchitecture(
                "import { D2Api as Client } from '$/types/d2-api'; function getWebappCompositionRoot() { return new Client(); }",
                "src/CompositionRoot.ts"
            )
        ).toEqual([]);
    });
    test("does not confuse a local class with the imported client", () => {
        expect(lintArchitecture("class D2Api {} new D2Api();")).toEqual([]);
    });
});

describe("alternative architecture layout", () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "architecture-layout-"));
    const options: ArchitectureOptions = {
        paths: {
            presentation: ["src/presentation/**"],
            repositories: ["src/data/**/*Repository.ts"],
            compositionRoots: [
                "src/presentation/AppCompositionRoot.ts",
                "src/presentation/TestCompositionRoot.ts",
            ],
            apiAdapters: ["src/data/common/utils/api-futures.ts"],
        },
        clientFactories: ["createApp", "createTest"],
    };
    beforeAll(() => {
        fs.writeFileSync(
            path.join(cwd, "tsconfig.json"),
            JSON.stringify({
                compilerOptions: {
                    baseUrl: ".",
                    paths: { "@/*": ["src/*"] },
                },
            })
        );
        for (const file of [
            "src/presentation/View.ts",
            "src/data/users/UserRepository.ts",
            "src/data/common/utils/api-futures.ts",
            "src/presentation/AppCompositionRoot.ts",
            "src/presentation/TestCompositionRoot.ts",
        ]) {
            fs.mkdirSync(path.dirname(path.join(cwd, file)), { recursive: true });
            fs.writeFileSync(path.join(cwd, file), "export {};\n");
        }
    });
    afterAll(() => fs.rmSync(cwd, { recursive: true, force: true }));
    const lint = (code: string, filename: string, overrides: ArchitectureOptions = {}) =>
        lintArchitecture(code, filename, { ...options, ...overrides }, cwd);
    test.each([
        "import { View } from '@/presentation/View';",
        "export { View } from '../../presentation/View';",
        "export * from '@/presentation/View';",
        "import('@/presentation/View');",
        "require('@/presentation/View');",
    ])("resolves domain boundary: %s", code => {
        const messages = lint(code, "src/domain/entities/Probe.ts");
        expect(messages).toHaveLength(1);
        expect(messages[0]?.message).toContain("src/presentation/View.ts");
    });
    test("checks data and presentation directions", () => {
        expect(lint("import '@/presentation/View';", "src/data/users/Probe.ts")).toHaveLength(1);
        expect(
            lint("import '../data/users/UserRepository';", "src/presentation/View.ts")
        ).toHaveLength(1);
        expect(
            lint("import '@/presentation/AppCompositionRoot';", "src/domain/Probe.ts")
        ).toHaveLength(1);
    });
    test("allows feature repositories and relocated adapters to import the client", () => {
        for (const filename of [
            "src/data/users/UserRepository.ts",
            "src/data/UserRepository.ts",
            "src/data/common/utils/api-futures.ts",
        ]) {
            expect(lint("import { D2Api } from '@eyeseetea/d2-api';", filename)).toEqual([]);
        }
        expect(
            lint("import { D2Api } from '@eyeseetea/d2-api';", "src/data/users/Helper.ts")
        ).toHaveLength(1);
        expect(lint("fetch('/api');", "src/data/users/UserRepository.ts")).toHaveLength(1);
    });
    test("roots override presentation classification and permit named and arrow factories", () => {
        for (const [filename, factory] of [
            ["src/presentation/AppCompositionRoot.ts", "createApp"],
            ["src/presentation/TestCompositionRoot.ts", "createTest"],
        ] as const) {
            const imports =
                "import '@/data/users/UserRepository'; import { D2Api as Client } from '@eyeseetea/d2-api';";
            for (const declaration of [
                `function ${factory}() { return new Client(); }`,
                `const ${factory} = () => new Client();`,
                `const ${factory} = function () { return new Client(); };`,
            ]) {
                expect(lint(imports + declaration, filename)).toEqual([]);
            }
            expect(lint(imports + "new Client();", filename)).toHaveLength(1);
            expect(
                lint(imports + "function other() { return new Client(); }", filename)
            ).toHaveLength(1);
        }
        expect(
            lint(
                "import { D2Api } from '@eyeseetea/d2-api'; function createApp() { return new D2Api(); }",
                "src/data/users/UserRepository.ts"
            )
        ).toHaveLength(1);
    });
    test("toggles checks independently", () => {
        expect(
            lint("import '@/presentation/View'; fetch('/api');", "src/domain/Probe.ts", {
                checks: { layerDependencies: false },
            })
        ).toHaveLength(1);
        expect(
            lint("import '@/presentation/View'; fetch('/api');", "src/domain/Probe.ts", {
                checks: { httpClientAccess: false },
            })
        ).toHaveLength(1);
        expect(
            lint(
                "import { D2Api } from '@eyeseetea/d2-api'; new D2Api();",
                "src/data/users/UserRepository.ts",
                { checks: { clientConstruction: false } }
            )
        ).toEqual([]);
    });
    test("empty patterns replace defaults and do not classify similarly prefixed folders", () => {
        expect(lint("fetch('/api');", "src/domain/Probe.ts", { paths: { domain: [] } })).toEqual(
            []
        );
        expect(lint("fetch('/api');", "src/domain-other/Probe.ts")).toEqual([]);
        expect(lint("import '@/data/users/UserRepository';", "src/webapp/Probe.ts")).toEqual([]);
    });
    test("rejects misspelled options", () => {
        expect(() =>
            lint("", "src/domain/Probe.ts", { checks: { typo: false } } as ArchitectureOptions)
        ).toThrow();
    });
    test.each([
        ["import '@/presentation/View'; fetch('/api');", "src/domain/Probe.ts"],
        ["import '@/presentation/View';", "src/data/users/Probe.ts"],
        [
            "import '@/data/users/UserRepository'; import { D2Api } from '@eyeseetea/d2-api'; new D2Api();",
            "src/presentation/View.ts",
        ],
        [
            "import { D2Api } from '@eyeseetea/d2-api'; new D2Api(); fetch('/api');",
            "src/data/users/UserRepository.ts",
        ],
        [
            "import '@/data/users/UserRepository'; import { D2Api } from '@eyeseetea/d2-api'; const createApp = () => new D2Api();",
            "src/presentation/AppCompositionRoot.ts",
        ],
    ])("wrapper matches independently enabled rules: %s", (code, filename) => {
        const combined = lintArchitecture(code, filename, options, cwd);
        const separate = lintArchitecture(code, filename, options, cwd, true);
        const diagnostics = (messages: typeof combined) =>
            messages.map(({ ruleId: _ruleId, ...message }) => message);
        expect(diagnostics(separate)).toEqual(diagnostics(combined));
        expect(separate.every(message => message.ruleId !== "eyeseetea/architecture")).toBe(true);
    });
});
