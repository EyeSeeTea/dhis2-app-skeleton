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

### Command Palette shortcuts (DHIS2 v42+)

Apps can register deep links that appear as searchable entries in the DHIS2 Command Palette (`Cmd/Ctrl + K`).

**Defining shortcuts**

Edit `shortcuts.json` in the project root:

```json
[
  { "name": "Import data",  "url": "#/import"   },
  { "name": "Settings",     "url": "#/settings" }
]
```

- `url` must be the hash portion of the route (e.g. `#/settings`). The skeleton uses `HashRouter`, so this is the correct format.
- Shortcuts are injected into `manifest.webapp` and `manifest.webapp.translations.json` automatically at build time.

**Build pipeline**

The following scripts run as part of `yarn build`:

| Script | What it does |
|---|---|
| `inject-shortcuts.ts` | Writes shortcuts into `build/manifest.webapp` |
| `generate-manifest-translations.ts` | Generates `build/manifest.webapp.translations.json` from `.po` files |

**Translating shortcut names**

Shortcut names follow the same `.po` workflow as the rest of the app strings, with one difference: the keys are not extracted from source code but from `shortcuts.json` by the `update-shortcuts-pot.ts` script, which runs automatically as part of `yarn update-po` (called by the `pre-push` git hook).

The workflow for adding a new shortcut with translations:

1. Add the shortcut to `shortcuts.json` with its English name.
2. Run `yarn update-po` (or push — the hook runs it automatically). This adds `__MANIFEST_SHORTCUT_<name>` keys to `i18n/en.pot` and propagates them to each `i18n/<locale>.po` via `msgmerge`.
3. Translate the new keys in the relevant `.po` files:
   ```
   msgid "__MANIFEST_SHORTCUT_Import data"
   msgstr "Importar datos"
   ```
4. Run `yarn build`. The script `generate-manifest-translations.ts` reads the `.po` files and includes the translations in `manifest.webapp.translations.json`.

DHIS2 reads `manifest.webapp.translations.json` at install time and uses it to display shortcut names in the user's language in the Command Palette.

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
