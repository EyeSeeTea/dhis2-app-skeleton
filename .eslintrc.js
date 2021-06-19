const { config } = require("@dhis2/cli-style");

module.exports = {
    extends: [
        config.eslintReact,
        "plugin:@typescript-eslint/recommended",
        "plugin:react-hooks/recommended",
        "plugin:import/typescript",
    ],
    parser: "@typescript-eslint/parser",
    rules: {
        "no-use-before-define": "off",
        "no-debugger": "warn",
        "no-console": ["warn", { allow: ["debug", "warn", "error"] }],
        "react/react-in-jsx-scope": "off",
        "@typescript-eslint/camelcase": "off",
        "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/ban-ts-ignore": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/indent": "off",
        "@typescript-eslint/member-delimiter-style": "off",
        "@typescript-eslint/type-annotation-spacing": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
    },
};
