/// <reference types="vitest" />
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";
import nodePolyfills from "vite-plugin-node-stdlib-browser";

export default ({ mode }) => {
    const env = { ...process.env, ...loadEnv(mode, process.cwd()) };
    const { targetUrl } = getConfig(env);

    // https://vitejs.dev/config/
    return defineConfig({
        base: "", // Relative paths
        plugins: [
            nodePolyfills(),
            react(),
            checker({
                typescript: true,
                eslint: {
                    lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
                    dev: { logLevel: ["error"] },
                },
            }),
        ],
        test: {
            environment: "jsdom",
            setupFiles: "./src/tests/setup.js",
            exclude: ["node_modules", "src/tests/playwright"],
            globals: true,
        },
        server: {
            port: parseInt(env.VITE_PORT),
            proxy: {
                "/dhis2": {
                    target: targetUrl,
                    changeOrigin: true,
                    rewrite: path => path.replace(/^\/dhis2/, ""),
                },
            },
        },
    });
};

function getConfig(env) {
    const dhis2UrlVar = "VITE_DHIS2_BASE_URL";
    const dhis2AuthVar = "VITE_DHIS2_AUTH";
    const proxyLogLevel = "VITE_PROXY_LOG_LEVEL";

    const targetUrl = env[dhis2UrlVar];
    const auth = env[dhis2AuthVar];
    const logLevel = env[proxyLogLevel] || "warn";

    if (!targetUrl) {
        console.error(`Set ${dhis2UrlVar}`);
        process.exit(1);
    }

    return { targetUrl };
}
