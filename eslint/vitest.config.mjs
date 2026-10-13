import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        include: ["eslint/**/*.spec.{ts,tsx,mjs}"],
    },
});
