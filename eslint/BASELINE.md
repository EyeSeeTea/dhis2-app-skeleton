# Native ESLint baseline

ESLint 9 bulk suppressions accept legacy findings and reject count increases without
extra tooling. Run commands from the project root.

## Commands

| Command | Behavior |
| --- | --- |
| `yarn lint` / `yarn lint:new` | Lint all `src`; fail on unsuppressed errors or unused suppressions. |
| `yarn lint:all` | Show all findings using the committed empty baseline; fails while legacy errors remain. |
| `yarn lint:cached` | Run the baseline gate with ESLint's content cache for local feedback. |
| `yarn lint:baseline` | Create or increase accepted error counts; requires deliberate review. |
| `yarn lint:baseline:prune` | Remove or reduce stale counts after fixes; never accepts new violations. |

`yarn check` uses this gate through `yarn lint`. `lint-all` also runs `ts-prune`
(unused-code analysis, not baselined); it is distinct from `lint:all`.

## Configuration and adoption

The reusable `eyeseetea-config.ts` defaults to warnings. The root config instead uses
`baseline-config.mjs`, which promotes policy warnings to errors without changing
scopes, exclusions, or options: native suppressions apply only to errors. Other
framework/base warnings remain advisory and unbaselined.

Commit `eslint-suppressions.json` as accepted debt. The gate explicitly names it,
so a missing file fails. Keep `eslint/empty-suppressions.json` as `{}` so `lint:all`
shows unsuppressed findings. Normal lint and inspection never rewrite either file.

To adopt in another project:

1. Install ESLint 9.24+ and compose the baseline profile after framework config;
   adapt layout and test scopes first.
2. Run `yarn lint:all`, review findings, fix correctness defects, and separate
   legitimate legacy constraints from configuration mistakes.
3. Run `yarn lint:baseline`, review the generated file, and commit it with the
   profile, config, and scripts. This accepts **all current rule errors**, including
   correctness errors. Use `--suppress-rule <rule-id>` for selective acceptance;
   never regenerate merely to make an unexplained failure pass.
4. Require `yarn lint:new` or `yarn check` in CI; never regenerate the baseline there.

For gradual adoption, retain `eyeseetea-config.ts` and promote selected rules through
scoped overrides.

## Everyday workflow

- Run `yarn lint:cached` locally; fix new violations rather than increasing counts.
  Document justified exceptions with narrow rule suppressions.
- After legacy fixes, run `yarn lint:baseline:prune` and commit the reduction with
  the fix. Normal lint fails on stale counts; keep
  `--pass-on-unpruned-suppressions` out of required CI.
- Review baseline increases, rule/config upgrades, and file moves or renames:
  baseline entries are path-specific.

## Guarantee and limitations

The baseline stores a **count per file and rule**, not violation identities or ages.
Exceeding a count fails and reports **all violations of that rule in the file**;
use the Git diff to identify the new one. New files have no accepted findings.

Fixing one violation and introducing another of the same rule in the same file can
pass with an unchanged count. Review must catch these replacements and changes to
accepted debt. Promoting warnings also makes conditional guidance blocking:
legitimate truthiness assertions or adapter constraints may need documented exceptions.

Editor integrations and direct Node API callers may show accepted findings unless
they support bulk suppressions. Policy regression tests intentionally inspect
unsuppressed diagnostics.

## Performance

CI runs one full lint pass plus native suppression bookkeeping. `lint:new` refers
to findings above accepted counts, not changed-line linting.

The local cache reuses unchanged files but may miss effects of imported type or
dependency changes, so required CI runs uncached. Keep `.eslintcache` ignored;
measure cold/warm timings on large projects before changing this tradeoff.

Reference: [ESLint bulk suppressions](https://eslint.org/docs/latest/use/suppressions).
