const { config } = require("@dhis2/cli-style");

module.exports = {
    ...require(config.prettier),
    printWidth: 120,
    tabWidth: 4,
    useTabs: false,
    semi: true,
    singleQuote: false,
    trailingComma: "es5",
    bracketSpacing: true,
    jsxBracketSameLine: false,
    arrowParens: "avoid",
    rangeStart: 0,
    rangeEnd: Infinity,
    proseWrap: "preserve",
    requirePragma: false,
    insertPragma: false,
};
