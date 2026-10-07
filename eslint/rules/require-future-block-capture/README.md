# eyeseetea/require-future-block-capture

Inside a `Future.block` callback, await a `Future` through the callback's capture function. This lets the block track the operation's cancellation and failure.

## Rule Details

Checks direct awaits in callbacks passed to `Future.block` and `Future.block_`.
Awaits in nested functions are outside the callback and are not checked.

Examples of **incorrect** code:

```ts
Future.block(async $ => {
    const user = await loadUser();
    return user;
});
```

Examples of **correct** code, when `loadUserFuture()` returns a `Future`:

```ts
Future.block(async $ => {
    const user = await $(loadUserFuture());
    return user;
});
```

## Options

This rule has no options. The EyeSeeTea config enables it as an error.

## Limitations

Recognizes calls on the identifier `Future`; aliases are not checked. It checks
capture syntax rather than the awaited value's type. Native Promises must be
adapted to Futures before capture. No automatic fix is provided.

## When Not To Use It

Disable this rule if the project does not use this Future abstraction. For a
justified interoperability exception, use a narrow suppression with an explanation.
