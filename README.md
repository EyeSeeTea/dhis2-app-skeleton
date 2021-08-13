## Setup

Install dependencies:

```
$ yarn install
```

## Development

Start a development server using a DHIS2 instance in http://localhost:8080:

```
$ PORT=8081 REACT_APP_DHIS2_BASE_URL="http://localhost:8080" yarn start
```

Now in your browser, go to `http://localhost:8081`.

NOTE: Create a file `.env.local` (copy it from `.env`) to set custom environment variables so you can simply run `yarn start`.

## Tests

Run unit tests:

```
$ yarn test
```

Run integration tests locally:

```
$ export CYPRESS_DHIS2_AUTH='admin:district'
$ export CYPRESS_EXTERNAL_API="http://localhost:8080"
$ export CYPRESS_ROOT_URL=http://localhost:8081

# non-interactive
$ yarn cy:e2e:run

# interactive UI
$ yarn cy:e2e:open
```

For this to work in Travis, you will have to create an environment variable `CYPRESS_DHIS2_AUTH`
(Settings -> Environment Variables) with the `user:password` used in your testing DHIS2 instance.

## Build app ZIP

```
$ yarn build-webapp
```

## Some development tips

### Structure

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

### App context

The file `src/contexts/app-context.ts` holds some general context so typical infrastructure objects (`api`, `d2`, ...) are readily available. Add your own global objects if necessary.

### Scripts

Check the example script, entry `"script-example"`in `package.json`->scripts and `src/scripts/example.ts`.
