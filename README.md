A DHIS2 + TypeScript + React app skeleton following best practices used at EyeSeeTea.

## Getting Started

```sh
nvm use
corepack enable
yarn install
```

Create `.env.local` from `.env` and set your DHIS2 instance URL and credentials. The defaults in `.env` point to a public play server. Then start the development server:

```sh
yarn start
```

Open `http://localhost:8081` in your browser.

### Build

```sh
yarn build
```

Produces a distributable DHIS2 `.zip` file.

### Tests, linting, type-checking

```sh
yarn test
yarn lint
yarn typecheck
```

## Architecture

Clean architecture with three layers:

| Directory | Purpose |
|---|---|
| `src/domain` | Entities, use cases, repository interfaces |
| `src/data` | Repository implementations (DHIS2 API, test doubles) |
| `src/webapp` | React presentation (pages, components, contexts) |
| `src/scripts` | CLI scripts |
| `src/types` | Shared type definitions |
| `src/utils` | Misc utilities |
| `i18n/` | Translations (gettext `.po` format) |
| `public/` | Static webapp resources |

The `$` path alias resolves to `src/`, so imports look like `import { Foo } from "$/domain/entities/Foo"`.

### Data structures (`src/domain/entities/generic`)

| Module | Description |
|---|---|
| `Future` | Cancellable async values with type-safe errors (lazily evaluated, unlike promises) |
| `Collection` | Wrapper over JS arrays with extended methods |
| `HashMap` | Immutable map (like ES6 Map, but immutable) |
| `Either` | Represents either a success value or an error |
| `Struct` | Base class for value objects with `create` and `update` |
| `Rec` | Extended methods for JS objects |
| `Pagination` | Pagination types |

### d2-api version

`src/types/d2-api.ts` centralizes all d2-api type and runtime imports. When targeting a different API version, only this file needs updating.

## Development Notes

### i18n

Update `.po` files from `i18n.t(...)` calls in source code:

```sh
yarn localize
```

### CLI scripts

App scripts live in `package.json` under `scripts`. Example:

```sh
yarn app:users-report --dhis2-url https://example.com --dhis2-auth user:pass
```

### Secrets scan

The `.husky/pre-push` hook scans committed files with [Trivy](https://trivy.dev/latest/getting-started/) before pushing. Rules are defined in `trivy-secret.yaml` — by default it checks that `VITE_DHIS2_AUTH` doesn't contain real credentials (anything other than `admin:district`). Markdown files are excluded since they may contain `.env` examples.

If Trivy is not installed, the scan can be skipped with a `(y/N)` prompt. To force-skip: `SKIP_SECRET_SCAN=1 git push`. **Make sure no secrets were added before using these skips.**

### Proxy

Requests to DHIS2 are proxied (see `vite.config.ts` → `server.proxy`) from `http://localhost:8081/dhis2/xyz` to `${VITE_DHIS2_BASE_URL}/xyz`, avoiding CORS issues.

### Environment variables

Use `import.meta.env.NAME` to access `.env` variables in the React app. It's recommended to read them at the app entry point and pass values down, rather than scattering `import.meta.env` calls throughout the code.

## Docs

Generate API documentation with [TypeDoc](https://typedoc.org/example/):

```sh
yarn generate-docs
```
