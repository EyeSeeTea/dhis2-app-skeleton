import tseslint from "typescript-eslint";
import baseConfig from "./eslint/base-config.mjs";
import reactConfig from "./eslint/react-config.mjs";
import testingConfig from "./eslint/testing-config.mjs";
import baselineConfig from "./eslint/baseline-config.mjs";

// Company policy comes last; errors are ratcheted using native CLI suppressions.
export default tseslint.config(...baseConfig, ...reactConfig, ...testingConfig, ...baselineConfig);
