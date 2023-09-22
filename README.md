## Setup

```
$ nvm use # uses node version in .nvmrc
$ yarn install
```

## Build production app ZIP

```
$ yarn build
```

## Development

Copy `.env` to `.env.local` and set the desired DHIS2 instance variables. Then start the development server:

```
$ yarn start
```

Now in your browser, go to `http://localhost:8081`.

## Tests

### Unit tests

```
$ yarn test
```

## Docs

```
$ yarn generate-docs
```

## Some development tips

### Clean architecture folder structure

-   `i18n/`: Contains literal translations (gettext format)
-   `public/`: Main app folder with a `index.html`, exposes the APP, contains the feedback-tool.
-   `src/pages`: Main React components.
-   `src/domain`: Domain layer of the app (clean architecture)
-   `src/data`: Data of the app (clean architecture)
-   `src/components`: Reusable React components.
-   `src/types`: `.d.ts` file types for modules without TS definitions.
-   `src/utils`: Misc utilities.
-   `src/locales`: Auto-generated, do not update or add to the version control.
-   `cypress/integration/`: Cypress integration tests.

### i18n

```
$ yarn localize
```

### Scripts

Check the example script, entry `"script-example"`in `package.json`->scripts and `src/scripts/example.ts`.

### Misc Notes

-   Requests to DHIS2 will be transparently proxied (see `vite.config.ts` -> `server.proxy`) from `http://localhost:8081/dhis2/xyz` to `${VITE_DHIS2_BASE_URL}/xyz`. This prevents CORS and cross-domain problems.

-   To use `.env` variables within the React app: `import.meta.env.NAME`
