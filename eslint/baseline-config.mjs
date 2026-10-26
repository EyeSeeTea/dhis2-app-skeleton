import eyeseeteaConfig from "./eyeseetea-config.ts";

// Native suppressions only apply to errors. Keep reusable policy defaults intact,
// preserving each block's file scope, exclusions, plugins, and rule options.
export default eyeseeteaConfig.map(config => ({
    ...config,
    rules: Object.fromEntries(
        Object.entries(config.rules ?? {}).map(([name, setting]) => {
            const [severity, ...options] = Array.isArray(setting) ? setting : [setting];
            return [name, [severity === "warn" || severity === 1 ? "error" : severity, ...options]];
        })
    ),
}));
