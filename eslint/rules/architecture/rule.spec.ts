import path from "node:path";
import { TSESLint } from "@typescript-eslint/utils";
const { Linter } = TSESLint;
import { parser } from "typescript-eslint";
import { describe, expect, test } from "vitest";
import architecture from "./rule";

function lintArchitecture(code: string, filename = "src/domain/entities/PolicyProbe.ts") {
    return new Linter().verify(
        code,
        [
            {
                files: ["**/*.ts"],
                languageOptions: { parser },
                plugins: { eyeseetea: { rules: { architecture } } },
                rules: { "eyeseetea/architecture": "warn" },
            },
        ],
        { filename: path.resolve(filename) }
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
