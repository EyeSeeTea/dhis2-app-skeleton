# EyeSeeTea ESLint policy

`eyeseetea-config.ts` implements automated checks for EyeSeeTea's coding conventions.
The coverage below describes the enforced checks and their limitations.
See the [downstream migration guide](MIGRATION.md) for adoption, gradual hardening,
and project-specific overrides.

## Organization

`eyeseetea-plugin.ts` exports the custom rules under the `eyeseetea` namespace:
[layer-dependencies](rules/layer-dependencies/README.md),
[http-client-access](rules/http-client-access/README.md),
[client-construction](rules/client-construction/README.md),
[no-collection-mutation](rules/no-collection-mutation/README.md), and
[require-future-block-capture](rules/require-future-block-capture/README.md).

Each rule lives in `rules/<rule-name>/` with `rule.ts`, `rule.spec.ts`, and
`README.md`; shared architecture helpers and regression tests live in `rules/shared/`.
Documentation includes rule details, examples, options, and limitations;
rule metadata links to that reference through `meta.docs.url`.
Policy integration tests live in `eyeseetea-config.spec.ts`.

`eyeseetea-config.ts` registers the plugin and defines policy scopes, options, and
severities, including third-party checks. The root `eslint.config.mjs` composes:

- `base-config.mjs`: JavaScript/TypeScript presets, parser setup, ignores, and general overrides.
- `react-config.mjs`: React and Hooks presets and project overrides.
- `testing-config.mjs`: Testing Library preset and test overrides.
- `baseline-config.mjs`: company policy promoted to errors, applied last to override framework defaults.

Future capture applies to all linted files; architecture and collection mutation
apply to `src/**/*.{ts,tsx}`. The severities below describe the reusable policy;
the skeleton promotes policy warnings through the [baseline profile](BASELINE.md).

## Select architecture checks independently

The three architecture rules have independent severities, options, and suppressions.
Share `paths` across them; pass `clientFactories` only to `client-construction`.
The reusable policy enables all three as warnings. For layer checks only, append:

```js
export default [{
    rules: {
        "eyeseetea/layer-dependencies": "warn",
        "eyeseetea/http-client-access": "off",
        "eyeseetea/client-construction": "off"
    }
}];
```

The rules share [path matching and TypeScript resolution](rules/shared/README.md)
while retaining independent configuration.

## Severity and legacy code

The reusable policy starts additions as **warnings** for gradual legacy adoption.
Review them before promoting rules to errors; warnings do not justify copying legacy
patterns. ESLint cannot determine code age.

The skeleton's baseline profile promotes policy warnings to errors, preserving
scopes and options, and records accepted file/rule counts in `eslint-suppressions.json`.
`yarn lint` fails on increases or stale counts; `yarn lint:all` shows accepted findings
too. Other framework warnings remain advisory; review them before adding
`--max-warnings=0`. See [BASELINE.md](BASELINE.md) for commands and limitations.

Definite safety/correctness checks are **errors**: `no-eval`, `no-implied-eval`,
`no-new-func`, `array-callback-return`, and `react-hooks/rules-of-hooks`.
Existing project errors, including the Future capture rule, remain enabled.

Use a narrow `eslint-disable-next-line <rule> -- <reason>` for a justified exception.
Prefer explaining the adapter, legacy constraint, or library contract over disabling
an entire directory. The Promise exclusions name the two Future implementation files
that necessarily implement the abstraction; new business code receives no blanket exemption.

## Coverage

| Coding convention | Automated checks | Level / limits |
| --- | --- | --- |
| Immutability | `prefer-const`, `no-var`, `no-param-reassign` including properties; local collection mutation rule | Warn. Typed Array/tuple, standard Map/Set mutators; custom methods called `push` are allowed. Arbitrary object mutation, aliasing, and shared-state analysis still require review. |
| Type safety | Explicit `any`; type-aware unsafe assignment, argument, call, member access, return, and type assertion rules; restricted `as unknown` and `as Type[]` | Warn. Safe widening and `as const` are allowed. Type guards and `satisfies` are preferred. |
| Layer dependencies | Layer dependency rule resolves imports using TypeScript configuration; checks static imports, re-exports, literal dynamic imports and `require` | Warn. Domain → data/UI/platform and data → UI are forbidden; presentation → concrete data is reported. Configurable layout paths. Checks direct dependencies, not transitive architectural purity. |
| API boundaries | d2-api import boundaries, aliased named `D2Api` construction, HTTP imports and platform HTTP globals | Warn. Repository/client adapter/composition-root imports allowed. By default, named client construction belongs in `getWebappCompositionRoot` in `CompositionRoot.ts`; roots, factory names, and individual architecture checks are configurable. Namespace constructors, indirect factory calls, and nonliteral dynamic imports need review. |
| Asynchronous code | Promise value/type references in domain/data; production `toPromise()` calls; existing Future capture rule | Warn, except capture errors. Tests allow Promises and `toPromise`. `Future.block` async callbacks remain valid. Inferred Promise returns and APIs exposed through aliases are not fully covered. |
| React styling and Hooks | Restricted `makeStyles` imports; React Hooks rules | Styling warns; hook correctness errors; dependencies warn. Styling namespace imports and component-vs-hook responsibilities need review. |
| Unit and component testing | Weak existence/truthiness matchers warn; Testing Library async queries, presence queries, explicit assertions and user-event guidance | Warnings allow legitimate existence checks. No Jest plugin: this repository runs Vitest. |
| End-to-end testing | Playwright `locator`, `$`, `$$`, `getByTestId` warn in `src/tests/playwright/**` or `*.e2e.ts(x)` | Prefer `getByRole`, `getByLabel`, `getByText`. Testing Library does not enforce Playwright APIs. Aliased helper functions need review. |
| Security | Dangerous evaluation/function construction; existing React safety checks | Errors for evaluation. This does not prove sanitization, boundary validation, or secret safety. |

Existing project warnings also cover console logging and unused variables. Unused
imports now warn through the already installed plugin. Floating Promises warn as a
correctness check. Strict TypeScript already rejects untyped function parameters.

## Deliberately omitted

- Blanket bans on loops, `forEach`, or inheritance: the EyeSeeTea rules target mutable
  accumulation and prefer composition; they do not prohibit every iteration or subclass
  (including subclasses of `Error`). Collection mutation checks target the concrete problem.
- A ban on every cast: safe widening is allowed by EyeSeeTea policy. The type-aware
  `no-unsafe-type-assertion` rule detects narrowing rather than enforcing a syntax style.
- TODO warnings: no authoritative rule prohibits TODO comments.
- A blanket functional or security plugin preset: these add policy and false positives
  beyond the source invariants. The targeted rules use existing dependencies.
- Forcing styled-components installation or migrating existing CSS: import checks prevent
  new `makeStyles`; changing existing styling is a separate refactor.

Single responsibility, domain modeling, repository contracts, input validation,
business-rule test coverage, composition-root completeness, and component/hook
responsibilities remain part of human/agent review. Static checks complement those
instructions; they cannot replace them.

## Verification

`yarn test` / `yarn test:unit` runs application tests; `yarn test:eslint` runs policy,
rule, and baseline regression tests through `eslint/vitest.config.mjs` in Node,
without React setup or browser polyfills. `yarn check` requires both suites.
`yarn lint` applies the EyeSeeTea policy to application TypeScript. Rule tests exercise
both positive and negative examples, including aliases, relative imports, legacy
interop exclusions, and legitimate similarly named methods.
