import type { TSESLint } from "@typescript-eslint/utils";
// Keep this policy separate from the project's framework and parser setup.
import eyeseeteaPlugin from "./eyeseetea-plugin.ts";
import testingLibrary from "eslint-plugin-testing-library";

const tests = [
    "**/*.{spec,test}.{ts,tsx}",
    "**/__tests__/**",
    "src/tests/**",
    "src/tests/playwright/**",
];
const syntax = [
    {
        selector:
            "TSAsExpression[typeAnnotation.type='TSUnknownKeyword'], TSTypeAssertion[typeAnnotation.type='TSUnknownKeyword']",
        message: "Do not use as unknown to bypass a type contract; validate or narrow the value.",
    },
    {
        selector:
            "TSAsExpression[typeAnnotation.type='TSArrayType'], TSTypeAssertion[typeAnnotation.type='TSArrayType']",
        message: "Do not cast to Type[]; use a typed binding, satisfies, or a type guard.",
    },
    {
        selector:
            "CallExpression[callee.type='MemberExpression'][callee.property.name='toPromise']",
        message:
            "Execute Futures with run(); toPromise() belongs in tests or an explicitly justified adapter.",
    },
];

export default [
    {
        plugins: { eyeseetea: eyeseeteaPlugin },
        rules: { "eyeseetea/require-future-block-capture": "error" },
    },
    {
        files: ["src/**/*.{ts,tsx}"],
        rules: {
            "eyeseetea/layer-dependencies": "warn",
            "eyeseetea/http-client-access": "warn",
            "eyeseetea/client-construction": "warn",
            "eyeseetea/no-collection-mutation": "warn",
            "prefer-const": "warn",
            "no-var": "warn",
            "no-param-reassign": ["warn", { props: true }],
            "array-callback-return": "error",
            "no-eval": "error",
            "no-implied-eval": "error",
            "no-new-func": "error",
            "no-restricted-syntax": ["warn", ...syntax],
            "no-restricted-imports": [
                "warn",
                {
                    paths: [
                        {
                            name: "@material-ui/core",
                            importNames: ["makeStyles"],
                            message: "Use styled-components for new components.",
                        },
                        {
                            name: "@material-ui/styles",
                            importNames: ["makeStyles"],
                            message: "Use styled-components for new components.",
                        },
                        {
                            name: "@mui/styles",
                            importNames: ["makeStyles"],
                            message: "Use styled-components for new components.",
                        },
                        {
                            name: "@material-ui/core/styles",
                            importNames: ["makeStyles"],
                            message: "Use styled-components for new components.",
                        },
                        {
                            name: "@material-ui/core/styles/makeStyles",
                            message: "Use styled-components for new components.",
                        },
                        {
                            name: "@material-ui/styles/makeStyles",
                            message: "Use styled-components for new components.",
                        },
                    ],
                },
            ],
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unsafe-assignment": "warn",
            "@typescript-eslint/no-unsafe-argument": "warn",
            "@typescript-eslint/no-unsafe-call": "warn",
            "@typescript-eslint/no-unsafe-member-access": "warn",
            "@typescript-eslint/no-unsafe-return": "warn",
            "@typescript-eslint/no-unsafe-type-assertion": "warn",
            "@typescript-eslint/no-floating-promises": "warn",
            "unused-imports/no-unused-imports": "warn",
            "react-hooks/rules-of-hooks": "error",
        },
    },
    {
        files: ["src/{domain,data}/**/*.{ts,tsx}"],
        ignores: [
            ...tests,
            "src/domain/entities/generic/Future.ts",
            "src/domain/entities/generic/FutureWithAccumulation.ts",
        ],
        rules: {
            "no-restricted-globals": [
                "warn",
                {
                    name: "Promise",
                    message:
                        "Use FutureData in domain and data; isolate Promise interop in a documented adapter.",
                },
            ],
            // Async Future.block callbacks remain valid; do not ban async/await.
            "no-restricted-syntax": [
                "warn",
                ...syntax,
                {
                    selector: "TSTypeReference[typeName.name='Promise']",
                    message: "Return FutureData instead of Promise in domain and data.",
                },
            ],
        },
    },
    {
        files: tests,
        plugins: { "testing-library": testingLibrary },
        rules: {
            "no-restricted-syntax": [
                "warn",
                ...syntax.slice(0, 2),
                {
                    selector:
                        "CallExpression[callee.type='MemberExpression'][callee.property.name=/^(toBeTruthy|toBeDefined)$/]",
                    message:
                        "Prefer toBe/toEqual when the exact value is knowable; existence checks may be justified.",
                },
            ],
            "testing-library/prefer-user-event": "warn",
            "testing-library/prefer-presence-queries": "warn",
            "testing-library/prefer-explicit-assert": "warn",
        },
    },
    {
        files: ["src/tests/playwright/**/*.{ts,tsx}", "**/*.e2e.{ts,tsx}"],
        rules: {
            "no-restricted-syntax": [
                "warn",
                ...syntax.slice(0, 2),
                {
                    selector:
                        "CallExpression[callee.type='MemberExpression'][callee.property.name=/^(locator|getByTestId)$/], CallExpression[callee.type='MemberExpression'][callee.property.name='$'], CallExpression[callee.type='MemberExpression'][callee.property.name='$$']",
                    message:
                        "Prefer accessible Playwright queries: getByRole, getByLabel, or getByText.",
                },
            ],
        },
    },
] satisfies TSESLint.FlatConfig.Config[];
