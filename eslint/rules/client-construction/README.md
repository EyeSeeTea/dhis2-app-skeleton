# eyeseetea/client-construction

Restrict imported D2Api construction to configured factories. Enabled as a warning for `src/**/*.{ts,tsx}` by the company policy.

## Rule Details

Reports construction of the named imported `D2Api` (including import aliases)
unless both the file is a configured composition root and an enclosing factory has
an allowed name. Supports function declarations and arrow/function expressions
bound to named variables. It does not restrict imports or HTTP access.

## Options

```js
"eyeseetea/client-construction": ["warn", {
    paths: { compositionRoots: ["src/presentation/AppCompositionRoot.ts"] },
    clientFactories: ["createApp"]
}]
```

See [shared architecture options](../shared/README.md#options) for `paths` groups,
globs, defaults, and replacement semantics. Roots and adapters override layer membership.
`clientFactories` defaults to `["getWebappCompositionRoot"]` and replaces the list of
allowed names. An empty list permits no construction.

## Limitations

Checks direct syntax, not transitive dependencies or whole-program data flow;
see [shared limitations](../shared/README.md#limitations).

## When Not To Use It

Disable if the policy does not apply; adapt paths for other layouts and use narrow,
justified suppressions for exceptions.
