## Setup

```
$ nvm use # uses node version in .nvmrc
$ yarn install
```

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

### Scripts

Check the example script, entry `"script-example"`in `package.json`->scripts and `src/scripts/example.ts`.

### Misc Notes

-   Requests to DHIS2 will be transparently proxied (see `vite.config.ts` -> `server.proxy`) from `http://localhost:8081/dhis2/xyz` to `${VITE_DHIS2_BASE_URL}/xyz`. This prevents CORS and cross-domain problems.

-   You can use `.env` variables within the React app: `const value = import.meta.env.NAME;`
