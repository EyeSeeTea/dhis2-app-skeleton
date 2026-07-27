import js from "@eslint/js";
import eslintPluginNoRelativeImportPaths from "eslint-plugin-no-relative-import-paths";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import testingLibrary from "eslint-plugin-testing-library";
import globals from "globals";
import tseslint from "typescript-eslint";

import requireFutureBlockCapture from "./eslint/rules/require-future-block-capture.js";

export default tseslint.config(
    {
        ignores: [
            "dist/**",
            "build/**",
            "node_modules/**",
            "coverage/**",
            "eslint.config.*",
            "src/**/snapshots/*.ts",
            "**/*.d.ts",
            "src/locales/**",
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    react.configs.flat.recommended,
    react.configs.flat["jsx-runtime"],
    reactHooks.configs.flat.recommended,
    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jest,
            },
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
            },
        },
        plugins: {
            local: {
                rules: {
                    "require-future-block-capture": requireFutureBlockCapture,
                },
            },
            "no-relative-import-paths": eslintPluginNoRelativeImportPaths,
        },
        settings: {
            react: {
                version: "detect",
            },
        },
        rules: {
            "no-console": ["warn", { allow: ["debug", "warn", "error"] }],
            "prefer-const": "warn",
            "@typescript-eslint/camelcase": "off",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/no-this-alias": "off",
            "@typescript-eslint/no-unnecessary-type-constraint": "off",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],
            "@typescript-eslint/no-unused-expressions": "warn",
            "react/prop-types": "off",
            "react/display-name": "off",
            "react/react-in-jsx-scope": "off",
            "no-unused-expressions": "off",
            "no-useless-concat": "off",
            "no-useless-constructor": "off",
            "no-unexpected-multiline": "off",
            "default-case": "off",
            "array-callback-return": "off",
            "@typescript-eslint/no-use-before-define": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-empty-interface": "off",
            "@typescript-eslint/no-empty-object-type": "off",
            "@typescript-eslint/ban-ts-ignore": "off",
            "@typescript-eslint/no-empty-function": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/ban-types": "off",
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/no-var-requires": "off",
            "@typescript-eslint/indent": "off",
            "@typescript-eslint/member-delimiter-style": "off",
            "@typescript-eslint/type-annotation-spacing": "off",
            "@typescript-eslint/no-misused-promises": "off",
            "no-use-before-define": "off",
            "no-debugger": "warn",
            "no-extra-semi": "off",
            "no-mixed-spaces-and-tabs": "off",
            "no-useless-rename": "off",
            "react-hooks/rules-of-hooks": "warn",
            "react-hooks/exhaustive-deps": "warn",
            "react/no-unknown-property": ["error", { ignore: ["jsx", "global"] }],
            "no-relative-import-paths/no-relative-import-paths": [
                "error",
                { allowSameFolder: true, rootDir: "src", prefix: "$" },
            ],
            "local/require-future-block-capture": "error",
        },
    },
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            parserOptions: {
                project: "./tsconfig.json",
            },
        },
        rules: {
            "@typescript-eslint/no-misused-promises": "warn",
        },
    },
    {
        files: ["**/*.{test,spec}.{js,jsx,ts,tsx}"],
        ...testingLibrary.configs["flat/react"],
        rules: {
            "testing-library/prefer-screen-queries": "off",
            "testing-library/no-debugging-utils": "off",
            "testing-library/no-dom-import": "off",
        },
    },
    {
        files: ["src/**/*.test.{ts,tsx}"],
        rules: {
            "testing-library/await-async-query": "error",
            "testing-library/no-await-sync-query": "error",
            "testing-library/prefer-screen-queries": "off",
            "testing-library/no-debugging-utils": "off",
            "testing-library/no-dom-import": "off",
        },
    },
);
