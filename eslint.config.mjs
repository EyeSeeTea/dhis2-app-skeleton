import tseslint from "typescript-eslint";
import baseConfig from "./eslint/base-config.mjs";
import reactConfig from "./eslint/react-config.mjs";
import testingConfig from "./eslint/testing-config.mjs";
import eyeseeteaConfig from "./eslint/eyeseetea-config.ts";

// Company policy comes last so its severities override framework defaults.
export default tseslint.config(...baseConfig, ...reactConfig, ...testingConfig, ...eyeseeteaConfig);
