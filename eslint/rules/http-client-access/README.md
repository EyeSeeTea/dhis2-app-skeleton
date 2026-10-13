# eyeseetea/http-client-access

Check platform and DHIS2 client access. Enabled as a warning for `src/**/*.{ts,tsx}` by the company policy.

## Rule Details

Reports domain platform globals and infrastructure imports, direct HTTP access in
repositories/presentation, and DHIS2 client or adapter imports outside repositories,
composition roots, and adapters. Shadowed platform names and local classes are allowed.
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

See [architecture options](../architecture/README.md#options) for `paths` groups,
globs, defaults, and replacement semantics. Roots and adapters override layer membership.

This rule accepts no `checks` switches; select the rule and its severity directly.
`clientFactories` applies only to `client-construction` and the compatibility wrapper.

## Limitations

Checks direct syntax, not transitive dependencies or whole-program data flow;
see [shared limitations](../architecture/README.md#limitations).

## When Not To Use It

Disable if the policy does not apply; adapt paths for other layouts and use narrow,
justified suppressions for exceptions.
