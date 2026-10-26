import js from "@eslint/js";
import tseslint from "typescript-eslint";
import noRelativeImportPaths from "eslint-plugin-no-relative-import-paths";
import unusedImports from "eslint-plugin-unused-imports";

export default tseslint.config(
    {
        ignores: [
            "dist/**",
            "build/**",
            "node_modules/**",
            "coverage/**",
            "eslint.config.*",
            "src/locales/**",
            "src/**/snapshots/*.ts",
            "**/*.d.ts",
        ],
    },

    js.configs.recommended,
    ...tseslint.configs.recommended,

    {
        languageOptions: {
            parserOptions: {
                ecmaVersion: "latest",
                project: "./tsconfig.json",
                sourceType: "module",
            },
        },
        plugins: {
            "no-relative-import-paths": noRelativeImportPaths,
            "unused-imports": unusedImports,
        },
        rules: {
            // TypeScript already resolves identifiers; core no-undef duplicates it
            // and does not know about DOM or Node globals here.
            "no-undef": "off",

            "no-console": ["warn", { allow: ["debug", "warn", "error", "info"] }],
            "prefer-const": "warn",
            "no-debugger": "warn",
            "no-unused-expressions": "off",
            "no-useless-concat": "off",
            "no-useless-constructor": "off",
            "no-unexpected-multiline": "off",
            "no-use-before-define": "off",
            "no-extra-semi": "off",
            "no-mixed-spaces-and-tabs": "off",
            "no-useless-rename": "off",
            "default-case": "off",
            "array-callback-return": "off",

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
            "@typescript-eslint/no-use-before-define": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-empty-interface": "off",
            "@typescript-eslint/no-empty-function": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/no-var-requires": "off",
            "@typescript-eslint/no-misused-promises": "warn",
            // typescript-eslint v8 moved this from `recommended` to `strict`.
            // Kept on so behaviour matches the previous config — the codebase
            // already carries eslint-disable comments where it uses `!`.
            "@typescript-eslint/no-non-null-assertion": "error",

            "no-relative-import-paths/no-relative-import-paths": [
                "error",
                { allowSameFolder: true, rootDir: "src", prefix: "$" },
            ],
        },
    },

    {
        files: ["**/*.js"],
        languageOptions: { parserOptions: { project: null } },
        rules: { "@typescript-eslint/no-misused-promises": "off" },
    }
);
