/// <reference types="vitest" />
import { UserConfig, defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import * as path from "path";

export default ({ mode }): UserConfig => {
    const env = { ...process.env, ...loadEnv(mode, process.cwd()) };
    const proxy = getProxy(env);

    // https://vitejs.dev/config/
    return defineConfig({
        base: "", // Relative paths
        plugins: [
            // md5.js (a direct dependency) uses Buffer, so the browser build
            // needs Node stdlib shims. Replaces vite-plugin-node-stdlib-browser,
            // which only supports Vite <= 4.
            nodePolyfills(),
            react(),
            // vite-plugin-checker 0.14 drives ESLint through the flat-config API
            // (languageOptions), which ESLint 8 rejects — it throws on server
            // start. Keep the typescript checker, and re-enable the eslint one
            // when the project moves to ESLint 9. `yarn lint` covers it meanwhile.
            checker({
                overlay: false,
                typescript: true,
            }),
        ],
        test: {
            environment: "jsdom",
            include: ["**/*.spec.{ts,tsx}"],
            setupFiles: "./src/tests/setup.ts",
            exclude: ["**/node_modules/**", "**/src/tests/playwright/**"],
            globals: true,
        },
        server: {
            port: parseInt(env.VITE_PORT),
            proxy: proxy,
        },
        resolve: {
            alias: {
                $: path.resolve(__dirname, "./src"),
            },
        },
    });
};

function getProxy(env: Record<string, string>) {
    const dhis2UrlVar = "VITE_DHIS2_BASE_URL";
    const dhis2AuthVar = "VITE_DHIS2_AUTH";
    const targetUrl = env[dhis2UrlVar];
    const auth = env[dhis2AuthVar];
    const isBuild = env.NODE_ENV === "production";

    if (isBuild) {
        return {};
    } else if (!targetUrl) {
        console.error(`Set ${dhis2UrlVar}`);
        process.exit(1);
    } else if (!auth) {
        console.error(`Set ${dhis2AuthVar}`);
        process.exit(1);
    } else {
        return {
            "/dhis2": {
                target: targetUrl,
                changeOrigin: true,
                auth: auth,
                rewrite: path => path.replace(/^\/dhis2/, ""),
            },
        };
    }
}
