# Adopting the EyeSeeTea ESLint configuration

Use this guide when bringing the policy into an existing downstream project.
The [policy reference](README.md) describes coverage and limitations. Adoption,
cleanup, and stricter enforcement should be separate changes so reviewers can
identify which findings come from the policy and which come from application edits.

## 1. Choose the adoption scope

The configuration currently ships as source in this repository, not as a published
ESLint package. Copy files from a recorded commit and record that revision in the
downstream project's tooling documentation. Compare upstream changes against that
revision when updating; keep project overrides separate from copied policy files.

| Approach                                     | Files to copy                                                                   | When to use it                                                    |
| -------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Full skeleton configuration                  | Root `eslint.config.mjs` and the complete `eslint/` directory                   | A DHIS2 React project using the skeleton's layout and conventions |
| Company policy with existing framework setup | `eslint/eyeseetea-config.ts`, `eslint/eyeseetea-plugin.ts`, and `eslint/rules/` | A project already using compatible ESLint flat config             |
| Selected custom rules                        | `eslint/eyeseetea-plugin.ts` and `eslint/rules/`                                | A project whose architecture or Promise conventions differ        |

Keep rule documentation with the implementation. If copying policy regression tests,
adapt their fixture paths and test runner setup: they use Vitest with a dedicated
Node configuration (`eslint/vitest.config.mjs`) and actual skeleton source paths.
Copy the `test:eslint` script and require it alongside application tests in CI;
do not expect fixtures to run unchanged in another application.

### Runtime and dependencies

Use Node 24.13.1 or a compatible newer Node 24 release consistently in developer shells,
CI, and the editor's ESLint runtime. The `.mjs` config imports local `.ts` files
using native type stripping. Installing a TypeScript parser alone does not enable
TypeScript execution. Older runtimes require a separately configured loader or a
compiled JavaScript distribution. An optional `eslint/package.json` containing
`{"type":"module"}` makes the policy's module format explicit without changing the
application's module format.

Install direct development dependencies using compatible versions from this
repository's `package.json`, and commit the downstream lockfile:

- All approaches: `eslint`, `typescript`, and `@typescript-eslint/utils`.
- Full configuration or company policy: `typescript-eslint`,
  `eslint-plugin-testing-library`, `eslint-plugin-unused-imports`, and
  `eslint-plugin-react-hooks`; register the latter two plugins in the consuming config.
- Full configuration also needs `@eslint/js`, `eslint-plugin-react`, and
  `eslint-plugin-no-relative-import-paths`.
- Selected rules with an existing TS parser need a compatible
  `@typescript-eslint/parser` or `typescript-eslint` setup.

The company policy is not standalone: it expects a TypeScript parser and registered
`@typescript-eslint`, `unused-imports`, and `react-hooks` plugins. The full composition
provides them. Align typescript-eslint packages to the same version family; do not
rely on dependencies being available only transitively.

If these files later become a shared package, publish compiled JavaScript and type
declarations. Native Node type stripping does not load `.ts` dependencies inside
`node_modules`. A published package is a future distribution option, not a required
migration step today.

### Incorporate the configuration

For full adoption, use the root composition from this repository. For policy-only
adoption, add it after the existing framework configuration and before local overrides:

```js
// eslint.config.mjs
import tseslint from "typescript-eslint";
import existingConfig from "./eslint/existing-config.mjs";
import eyeseeteaConfig from "./eslint/eyeseetea-config.ts";
import projectOverrides from "./eslint/project-overrides.mjs";

export default tseslint.config(...existingConfig, ...eyeseeteaConfig, ...projectOverrides);
```

Here `existing-config.mjs` is the project's existing flat config exported as an
array, including the parser and plugins listed above. `project-overrides.mjs` is a
local array of explicit adjustments. These two files are created by the downstream
project; they are not supplied by this repository.

For selected-rule adoption, register the plugin in the existing typed configuration:

```js
import eyeseeteaPlugin from "./eslint/eyeseetea-plugin.ts";

// Append this entry to the existing config array.
const selectedRules = {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { eyeseetea: eyeseeteaPlugin },
    rules: {
        "eyeseetea/no-collection-mutation": "warn",
        "eyeseetea/require-future-block-capture": "error",
    },
};
```

Omit Future capture if the project does not use this Future abstraction. Collection
mutation requires parser type information even when its severity is only `warn`.

## 2. Check the project assumptions

Review these before the first lint run:

| Assumption                                                                | Downstream adjustment                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ESLint 9 flat config                                                      | Migrate an existing `.eslintrc` separately and verify its old checks remain enabled.                                                                                                                                                                                             |
| Commands run from the project root                                        | Set the parser's `tsconfigRootDir` explicitly if tools use another working directory.                                                                                                                                                                                            |
| Parser uses `./tsconfig.json`                                             | Include every linted TS file, or point `parserOptions.project` at a dedicated `tsconfig.eslint.json`. Preserve application build settings.                                                                                                                                       |
| Typechecking includes `eslint/**/*.ts` and allows `.ts` import extensions | Include copied rules in a no-emit typecheck; use `allowImportingTsExtensions: true`.                                                                                                                                                                                             |
| Source is under `src/`, with `$/*` imports                                | Adapt policy file globs, base import-path options, and TS aliases.                                                                                                                                                                                                               |
| Layers are `src/domain`, `src/data`, `src/webapp`, and `src/scripts`      | Configure `paths` on each architecture rule and `clientFactories` on `client-construction` for the project layout. Roots and adapters take precedence over their containing layer. See the [architecture options](rules/shared/README.md#options); no directory restructuring is required. |
| Domain/data use Futures                                                   | Review Promise restrictions and the two Future implementation exclusions. Projects using native Promises should adopt selected rules or maintain an explicitly adapted policy.                                                                                                   |
| React, Material UI, and Testing Library conventions apply                 | Omit irrelevant framework modules and adapt company rules; the styling rule recommends styled-components but does not install it.                                                                                                                                                |
| Unit tests use `*.spec.ts(x)`                                             | The framework testing preset covers `.spec` files, while company test overrides also cover `.test`, `__tests__`, and `src/tests`. Align both scopes with the project.                                                                                                            |
| E2E tests use `src/tests/playwright` or `*.e2e.ts(x)`                     | Adapt both E2E checks and general test exclusions for other locations.                                                                                                                                                                                                           |
| Generated files use skeleton paths                                        | Review global ignores and lint command targets. An ignored file receives no checks.                                                                                                                                                                                              |

Architecture rules accept layout options; `client-construction` also accepts factory
names. Other custom rules have no options. Adjust severities and scopes through flat
config; monorepos need per-package parser projects and scoped entries.

### Feature-based layouts

For repositories under `src/data/<feature>/`, presentation under `src/presentation/`,
and multiple composition roots, append an override after the company policy:

```js
const paths = {
    presentation: ["src/presentation/**"],
    repositories: ["src/data/**/*Repository.ts"],
    compositionRoots: [
        "src/presentation/AppCompositionRoot.ts",
        "src/presentation/TestCompositionRoot.ts"
    ],
    apiAdapters: ["src/data/common/utils/api-futures.ts", "src/types/d2-api.ts"]
};

export default [{
    files: ["src/**/*.{ts,tsx}"],
    rules: {
        "eyeseetea/layer-dependencies": ["warn", { paths }],
        "eyeseetea/http-client-access": ["warn", { paths }],
        "eyeseetea/client-construction": ["warn", {
            paths,
            clientFactories: ["createApp", "createTest"]
        }]
    }
}];
```

Use actual filenames and factories; include client type wrappers in `apiAdapters`.
Supplied arrays replace defaults. Keep repository patterns narrow: they grant client
access. For layer checks only, disable `http-client-access` and `client-construction`
in the final override. Each rule has independent severity and suppressions.

[Policy-only composition](#incorporate-the-configuration) leaves framework presets
under the consuming project's control.

## 3. Establish a baseline and adopt in CI

1. Record the existing lint/typecheck/test results before changing configuration.
2. Run the new configuration without autofixing and save a report:
   `yarn eslint src --format json --output-file eslint-migration-report.json`.
   A report can be written even when errors cause a nonzero exit code.
3. Classify findings into defects, intentional exceptions, and legacy cleanup. Assign
   cleanup owners and track temporary exceptions with an issue and a review date.
4. Resolve configuration failures first: missing plugins, files outside the TS project,
   incompatible runtimes, and incorrect file scopes are not application violations.
5. Fix error-level violations before making the new lint job required. The default
   policy already makes Future capture, dangerous evaluation, callback returns, and
   Hooks correctness errors. It does not introduce every rule as a warning.
6. Keep warnings visible in required CI with `yarn lint`, alongside typecheck and
   tests. Avoid `--quiet` and a global `--max-warnings=0` while legacy warnings remain.

A saved JSON report is an inventory, not an enforcement baseline. By default ESLint
cannot distinguish existing findings from newly introduced ones. During this stage,
review new warnings in PRs. If automated prevention is required, add a separately
reviewed baseline comparison or enforce selected rules in already cleaned scopes.
A total warning count alone can miss a new violation when an old one is removed.
Linting only changed files also reports old findings within those files and can miss
dependency changes elsewhere.

### Native baseline alternative (used by this skeleton)

The [native baseline profile](BASELINE.md) rejects count increases. Copy
`baseline-config.mjs` and `empty-suppressions.json` with the policy, use the profile
last in the root config instead of `eyeseetea-config.ts`, and copy the baseline scripts
from `package.json`. The profile promotes policy warnings without changing scopes or options.

Review findings before generating **project-specific** `eslint-suppressions.json`;
never copy the skeleton's counts. Require `lint:new` in CI, prune after fixes, and
keep `empty-suppressions.json` as `{}` for unsuppressed `lint:all` inspection.
Matching is by file/rule count: replacing a violation with another in the same bucket
can pass. See the baseline guide for adoption steps and limitations.

## 4. Harden incrementally

Promote one rule or one cleaned scope at a time. Start with checks whose findings
have been reviewed and resolved, then expand the strict scope as cleanup progresses.
Append downstream overrides after the EyeSeeTea policy:

```js
// eslint/project-overrides.mjs
export default [
    {
        files: ["src/domain/usecases/**/*.{ts,tsx}"],
        rules: {
            "eyeseetea/no-collection-mutation": "error",
            "@typescript-eslint/no-floating-promises": "error",
            "@typescript-eslint/no-explicit-any": "error",
        },
    },
    {
        linterOptions: { reportUnusedDisableDirectives: "error" },
    },
];
```

Severity-only overrides retain existing rule options. For example,
`"no-param-reassign": "error"` preserves the policy's `props: true` option.
Enable unused suppression errors after removing stale directives. Once the complete
lint target has zero accepted warnings, `yarn eslint src --max-warnings=0` can become
a required gate. Until then, enforce cleaned rules as errors without making unrelated
legacy warnings fail the build.

Do not apply a blanket strict preset as part of adoption: additional rules need their
own review for applicability and false positives. Keep correctness checks enabled
while hardening type safety, architecture, and immutability independently.

## 5. Tweak deliberately and keep exceptions narrow

A project override should name the affected files, the exact rule, and the reason:

```js
// Append to project-overrides.mjs.
const vendorAdapterException = {
    files: ["src/data/adapters/VendorMutableBuffer.ts"],
    rules: {
        // Vendor API requires in-place buffer updates; review when the API changes.
        "eyeseetea/no-collection-mutation": "off",
    },
};
```

For a single statement, prefer a documented inline exception:

```ts
// eslint-disable-next-line eyeseetea/no-collection-mutation -- Vendor API requires this mutable buffer.
buffer.push(value);
```

These examples must be appended to the exported config array to take effect. Avoid
broadly disabling rules for all data code or all tests to accommodate one adapter.
A block's `ignores` only excludes that block; a separate later block does not undo
an earlier rule by ignoring files. Use a scoped rule override to change its severity.

When modifying options for `no-restricted-syntax` or `no-restricted-imports`, provide
the complete intended options: later arrays replace earlier options rather than
appending selectors or paths. In particular, replacing `no-restricted-syntax` to allow
`toPromise()` can also remove cast and test assertion checks. For substantial selector
changes, maintain an explicit policy adaptation with tests rather than relying on
array indexes in the upstream config.

## 6. Verify adoption and upgrades

Run lint, typecheck, and application tests, plus the copied/adapted rule regression
tests. Use `yarn eslint --print-config <existing-file>` for an actual production file,
a unit test, an E2E test, and an adapter to confirm final severities, plugin registration,
and exclusions. Confirm developer shells, CI, and editor linting agree.

On each upstream update, compare policy files and dependencies with the recorded
revision, review new checks and changed scopes, and repeat the baseline review before
raising severities. Keep dependency upgrades and policy hardening separately reviewable.
For rollback, revert the adoption/configuration commit and its dependency changes;
avoid disabling all lint checks to restore a passing build.

References: [ESLint rule overrides](https://eslint.org/docs/latest/use/configure/rules),
[ESLint CLI](https://eslint.org/docs/latest/use/command-line-interface),
[typed parser configuration](https://typescript-eslint.io/packages/parser/), and
[Node TypeScript execution](https://nodejs.org/docs/latest-v24.x/api/typescript.html).
