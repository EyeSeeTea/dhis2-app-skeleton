import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
    react.configs.flat.recommended,
    react.configs.flat["jsx-runtime"],
    reactHooks.configs.flat.recommended,
    {
        settings: {
            react: { version: "detect" },
        },
        rules: {
            "react/prop-types": "off",
            "react/display-name": "off",
            "react/react-in-jsx-scope": "off",

            "react-hooks/rules-of-hooks": "warn",
            "react-hooks/exhaustive-deps": "warn",
            // TODO: Enable `react-hooks/set-state-in-effect`.
            "react-hooks/set-state-in-effect": "off",
        },
    },
];
