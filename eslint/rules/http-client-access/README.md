# eyeseetea/http-client-access

Check platform and DHIS2 client access. Enabled as a warning for `src/**/*.{ts,tsx}` by the company policy.

## Rule Details

Reports domain platform globals and infrastructure imports, direct HTTP access in
repositories/presentation, and DHIS2 client or adapter imports outside repositories,
composition roots, and adapters. Shadowed platform names and local classes are allowed.
Type-only platform references such as `payload: Blob` are allowed; runtime access
such as `new Blob()` in domain code is reported.
It does not enforce application-layer imports or constructor locations.

## Options

```js
"eyeseetea/http-client-access": ["warn", {
    paths: {
        presentation: ["src/presentation/**"],
        repositories: ["src/data/**/*Repository.ts"],
        compositionRoots: ["src/presentation/AppCompositionRoot.ts"],
        apiAdapters: ["src/data/common/utils/api-futures.ts", "src/types/d2-api.ts"]
    }
}]
```

See [shared architecture options](../shared/README.md#options) for `paths` groups,
globs, defaults, and replacement semantics. Roots and adapters override layer membership.

`clientFactories` applies only to `client-construction`.

## Limitations

Checks direct syntax, not transitive dependencies or whole-program data flow;
see [shared limitations](../shared/README.md#limitations).

## When Not To Use It

Disable if the policy does not apply; adapt paths for other layouts and use narrow,
justified suppressions for exceptions.

Repositories calling external APIs rather than DHIS2 may use an appropriate HTTP
client. Add a scoped config exception or, for a dedicated external API repository,
a file-level comment naming the integration and reason:

```ts
/* eslint-disable eyeseetea/http-client-access -- Calls the external weather API; d2-api only supports DHIS2. */
```

This disables all checks in this rule for the file; layer dependency and client
construction rules remain active. Prefer a statement-level exception for mixed
DHIS2/external access.
