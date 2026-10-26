# eyeseetea/layer-dependencies

Check application-layer dependency directions. Enabled as a warning for `src/**/*.{ts,tsx}` by the company policy.

## Rule Details

Reports domain imports from data, presentation, composition roots, and API adapters;
data imports from presentation or composition roots; and presentation imports from data.
It resolves imports, re-exports, literal dynamic imports, and literal `require` calls
through TypeScript before matching the target against the configured paths.

## Options

```js
"eyeseetea/layer-dependencies": ["warn", {
    paths: {
        presentation: ["src/presentation/**"],
        compositionRoots: ["src/presentation/AppCompositionRoot.ts"]
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
