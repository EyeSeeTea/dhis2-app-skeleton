## Setup

Install dependencies:

```
$ yarn install
```

## Development

Start development server:

```
$ PORT=8081 yarn start
```

Linting:

```
$ yarn lint
```

## Tests

Run unit tests:

```
$ yarn test
```

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

### i18n

```
$ yarn localize
```

### App context

The file `src/webapp/contexts/AppContext.ts` holds some general context so typical infrastructure objects (`api`, `d2`, ...) are readily available. Add your own global objects if necessary.
