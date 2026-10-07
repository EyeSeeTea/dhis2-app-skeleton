import testingLibrary from "eslint-plugin-testing-library";

export default [
    {
        files: ["**/*.spec.{ts,tsx}"],
        ...testingLibrary.configs["flat/react"],
        rules: {
            ...testingLibrary.configs["flat/react"].rules,
            "testing-library/await-async-queries": "error",
            "testing-library/no-await-sync-queries": "error",
            "testing-library/prefer-screen-queries": "off",
            "testing-library/no-debugging-utils": "off",
            "testing-library/no-dom-import": "off",
        },
    },
];
