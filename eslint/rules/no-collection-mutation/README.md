# eyeseetea/no-collection-mutation

Prefer new collections over in-place mutations. Enabled as a warning for
production `src/**/*.{ts,tsx}` by the EyeSeeTea config. Test scopes are excluded
to allow mutable fixture builders. Requires TypeScript type information.

## Rule Details

Reports mutating methods on typed arrays and tuples: `push`, `pop`, `shift`,
`unshift`, `splice`, `sort`, `reverse`, `fill`, and `copyWithin`.
Also reports standard-library Map `set`, `delete`, and `clear`, and Set `add`,
`delete`, and `clear`. Literal computed method access is checked too.

Examples of **incorrect** code:

```ts
const values = [1, 2];
values.push(3);
values["sort"]();
const lookup = new Map<string, number>();
lookup.set("a", 1);
```

Examples of **correct** code:

```ts
const values = [1, 2];
const extended = [...values, 3];
const sorted = [...values].toSorted();
const lookup = new Map<string, number>([["a", 1]]);
```

## Options

This rule has no options.

## Limitations

Does not analyze aliasing, shared state, arbitrary property assignments, or
nonliteral computed method names. Unrelated application methods named `push`,
`set`, or `add` are allowed. There is no automatic fix because mutation and its
return value may be intentional.

## When Not To Use It

Disable this rule where a library contract or performance requirement calls for
mutation. Prefer a narrow suppression explaining the constraint.
