# require-future-block-capture

Inside a `Future.block` callback, await a `Future` through the callback's capture function. This lets the block track the operation's cancellation and failure.

Incorrect:

```ts
Future.block(async $ => {
    const user = await loadUser();
    return user;
});
```

Correct, when `loadUserFuture()` returns a `Future`:

```ts
Future.block(async $ => {
    const user = await $(loadUserFuture());
    return user;
});
```
