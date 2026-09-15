/// <reference types="vite/client" />
// `globals: true` in the vitest config exposes describe/it/expect without an
// import; this makes TypeScript aware of them. jest-dom v5 used to pull the
// equivalent ambient types in as a side effect, v6 no longer does.
/// <reference types="vitest/globals" />
