## Setup

```
$ nvm use # uses node version in .nvmrc
$ yarn install
```

This project uses **Yarn 4** managed by **Corepack** and declares:

```json
"packageManager": "yarn@4.12.0"
```

### Recommended: disable Corepack auto-pin globally (macOS, zsh)

To avoid Corepack modifying the `package.json` of **other** projects when you run `corepack enable` or `yarn` in repositories that do **not** define `packageManager`, it is recommended to disable the global auto‑pin:

1. Open your shell configuration (`zsh`):

    ```bash
    nano ~/.zshrc   # or use code/vim, etc.
    ```

2. Add this line at the end of the file:

    ```bash
    export COREPACK_ENABLE_AUTO_PIN=0
    ```

3. Reload the configuration in the current session:

    ```bash
    source ~/.zshrc
    ```

4. Verify that it is active:

    ```bash
    echo $COREPACK_ENABLE_AUTO_PIN
    # should print: 0
    ```

From that point on, with `corepack enable` active, when you run `yarn` in projects **without** `packageManager`, Corepack will no longer add the `packageManager` field automatically to their `package.json`.

### If you have Yarn 1 globally and see a packageManager error

If running `yarn` shows an error like:

> This project's package.json defines "packageManager": "yarn@4.12.0". However the current global version of Yarn is 1.22.x.

do the following once on your machine:

```bash
# 1) Remove global Yarn (optional but recommended)
npm uninstall -g yarn

# 2) Enable Corepack (shipped with Node 16.9+ / 14.19+)
corepack enable

# 3) Set Yarn 1.x as the default for projects WITHOUT packageManager
corepack prepare yarn@1.22.22 --activate
```

Then, in this project (normal case, once Corepack is enabled):

```bash
nvm use                 # use the version from .nvmrc
yarn install
```

If for some reason `yarn --version` still shows `1.x` inside this repo (for example due to old Corepack state), prepare the Yarn 4 binary without changing the global default or `package.json`:

```bash
COREPACK_ENABLE_AUTO_PIN=0 corepack prepare yarn@4.12.0
yarn --version          # should now print 4.12.0
yarn install
```

After this:

-   This repo will use **Yarn 4.12.0**.
-   Other repos without `packageManager` will keep using **Yarn 1.22.22** (or whatever you activated with `corepack prepare`).

### Select d2-api version

`src/types/d2-api.ts` imports all the types and runtime objects needed by the app. Update it so it targets your desired DHIS2 version. This way, if we need to target another version in the future, only this file will need to be updated.

## Build

Build a production distributable DHIS2 zip file:

```
$ yarn build
```

## Development

Copy `.env` to `.env.local` and configure DHIS2 instance to use. Then start the development server:

```
$ yarn start
```

Now in your browser, go to `http://localhost:8081`.

## Tests

```
$ yarn test
```

## Check

Run all code-quality to validate changes:

```
$ yarn run check
```

This runs the TypeScript typecheck, Prettier check, lint, and tests.
Individual checks can also be run with `yarn typecheck`, `yarn prettify:check`, `yarn lint`, and `yarn test`.

## Some development tips

### Clean architecture folder structure

-   `src/domain`: Domain layer of the app (entities, use cases, repository definitions)
-   `src/data`: Data of the app (repository implementations)
-   `src/webapp/pages`: Main React components.
-   `src/webapp/components`: React components.
-   `src/utils`: Misc utilities.
-   `i18n/`: Contains literal translations (gettext format)
-   `public/`: General non-React webapp resources.

## Data structures

-   `Future.ts`: Async values, similar to promises, but cancellables and with type-safe errors.
-   `Collection.ts`: Similar to Lodash, provides a wrapper over JS arrays.
-   `Obj.ts`: Similar to Lodash, provides a wrapper over JS objects.
-   `HashMap.ts`: Similar to ES6 map, but immutable.
-   `Struct.ts`: Base class for typical classes with attributes. Features: create, update.
-   `Either.ts`: Either a success value or an error.

## Docs

We use [TypeDoc](https://typedoc.org/example/):

```
$ yarn generate-docs
```

### i18n

Update i18n .po files from `i18n.t(...)` calls in the source code:

```
$ yarn localize
```

### Scripts

Check the example script, entry `"script-example"`in `package.json`->scripts and `src/scripts/example.ts`.

### Secrets scan

The hook `.husky/pre-push` will scan the committed files with [Trivy](https://trivy.dev/latest/getting-started/) before pushing them.

The scan rules are defined at `trivy-secret.yaml`, there you can add rules to match or ignore strings. The default rule is to check that `VITE_DHIS2_AUTH` is not leaked. This means that a value that is not `"admin:district"` or `'admin:district'` will trigger the leak scan.

Please note that markdown files are not scanned as they may contain examples of how to use the `.env` files.

If Trivy is not installed the scan can be skipped with a (y/N) prompt.
If the scan is having some issue or needs to be skipped for some reason use `SKIP_SECRET_SCAN=1 git push`.

The rationale of these skips is to avoid blocking work. **Please, make sure that no secrets were added before using them.**

In any case there is a GitHub action to perform a scan of the pushed content, **but it can't prevent leaks**, just allows to mitigate them faster.

### Misc Notes

-   Requests to DHIS2 will be transparently proxied (see `vite.config.ts` -> `server.proxy`) from `http://localhost:8081/dhis2/xyz` to `${VITE_DHIS2_BASE_URL}/xyz`. This prevents CORS and cross-domain problems.

-   You can use `.env` variables within the React app: `const value = import.meta.env.NAME;`
