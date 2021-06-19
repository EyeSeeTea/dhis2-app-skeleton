const jestConfig = require("@dhis2/cli-app-scripts/config/jest.config");

module.exports = {
    ...jestConfig,
    transformIgnorePatterns: ["/node_modules/(?!@eyeseetea/d2-ui-components)"],
};
