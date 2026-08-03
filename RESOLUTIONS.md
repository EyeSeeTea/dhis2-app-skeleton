# Yarn Resolutions

This file documents every entry in the `resolutions` block of `package.json`. Each entry should answer three questions: **what is being pinned**, **why it exists**, and **when it can be removed**.

`package.json` doesn't allow comments, so this file is the only place that knowledge lives. **If you add or remove a resolution, update this file in the same commit.**

## Conventions

- **`^` range or exact version? Ask what the number is asserting.**

    A **floor** — "never below this" — takes a `^` range. Almost every security pin is a floor: it does not matter whether axios resolves to 1.18.0 or 1.19.0, only that it is not 1.13.5. Newer is strictly better, so let it land.

    A **fixture** — "exactly this" — takes an exact version. These are compatibility constraints, not security ones: something else binds to that specific release. `@types/react`, `i18next` and `@dhis2/cli-app-scripts` below are the three in this file.

    The two failure modes are mirror images. An exact version where a floor belonged **decays**: `axios: 1.13.5` was correct in February and carried 10 open high-severity advisories by July, because no patch could ever land. Decay has a nastier form still — `qs: 6.14.2` was written to fix an advisory, and a later advisory landed on 6.14.2 itself, so the pin ended up holding the whole tree _at_ the vulnerable version rather than above it. A `^` range where a fixture belonged **surprises**: `@dhis2/cli-app-scripts: ^12` resolved to 12.11.3, which silently started injecting `__MANIFEST_APP_*` entries into the translation bundle.

    In practice: is there a higher version that would also work? Then use `^`. Does something bind to this exact release? Then pin it — **and write the condition for unpinning it.** If you cannot state that condition, it should probably have been a `^` range.

- Prefer **per-parent** paths (`parent/child`) over standalone descriptors. Yarn-berry only matches a standalone descriptor on exact text — `picomatch@npm:^4` will _not_ match a child request of `^4.0.2`. The reliable forms are `parent/child`, `parent@npm:<exact-version>/child`, or `parent@npm:^<major>/child`.
- **Versioned-parent pins go stale silently.** When a parent patch-bumps, `parent@npm:<exact>/child` matches nothing and yarn does not warn. `execa@npm:0.7.0/cross-spawn` below is the one entry of that shape.
- **A pin that clears the scanner but breaks a consumer is not a fix.** Two pins were tried and reverted during this pass — see "Rejected pins" below. Verify with the tool that actually uses the package, not just `yarn install`.

## Audit cadence

Run `/sca-triage` monthly or before every release. The classifier will surface any silently-broken resolution as a recurring high-severity finding. Each entry below has a **drop when** condition — when that condition becomes true, delete the entry and re-install.

Note that `yarn npm audit` and Dependency-Track disagree on severity: `esbuild` and `uuid` are scored below 7 by the GitHub advisory database and above 7 by Dependency-Track. **The CI gate follows Dependency-Track**, so measure there before concluding an app is clean.

---

## Active resolutions

### Pre-existing (rationale not recovered)

All added in a single commit, `8a8d2b4` ("fix(security): mitigate dependency vulnerabilities", 2026-02-26), with no recorded rationale. None currently resolves to a version with an open critical or high advisory. They were converted from exact versions to `^` ranges where safe, and are kept pending a one-at-a-time prune: remove, reinstall, and check nothing reappears.

| Pin                       | Notes                                                                                                                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@babel/runtime: 7.26.10` | Historic advisory in the 7.26 line. **Prune candidate** — verify with `yarn why @babel/runtime` after removal.                                                                          |
| `glob-parent: 5.1.2`      | Almost certainly CVE-2020-28469 (ReDoS in `< 5.1.2`). **Prune candidate.**                                                                                                              |
| `nanoid: 3.3.8`           | Historic advisory in `< 3.3.8`. **Prune candidate.**                                                                                                                                    |
| `node-fetch: 2.6.7`       | Historic advisory in `< 2.6.7`. **Prune candidate.**                                                                                                                                    |
| `path-to-regexp: 1.9.0`   | ReDoS in the 1.x line, reached through `react-router-dom@5.3.4`. **Drop when** `react-router-dom` v5 is removed or upgraded — it is the only consumer.                                  |

#### `@types/react: 18.2.22` and `@types/react-dom: 18.2.7`

- **Why:** ⚠️ **Not security pins.** They force every transitive consumer onto the React 18 type definitions; several `@dhis2/*` and Material-UI packages peer on `@types/react@^17`, and mixing the two breaks `yarn typecheck`. They deliberately mirror the `devDependencies` entries.
- **Fixes:** Nothing — typecheck stability only.
- **Drop when:** No package in the tree requests React 17 types. Verify with `yarn why @types/react`. **Do not remove these as "undocumented pins"** — that is what this entry exists to prevent.

#### `i18next: 19.8.5`

- **Why:** Held at the version `@dhis2/d2-i18n` expects. ⚠️ **Do not change this blind.** Moving off this line has been observed to break app startup with `Uncaught TypeError: i18next.init is not a function`, because `@dhis2/d2-i18n` binds to an older i18next API. The correct version is specific to which `@dhis2/d2-i18n` this app uses, so validate by running the app rather than copying a version from elsewhere.
- **Fixes:** Historic prototype-pollution advisories in the older i18next lines.
- **Drop when:** `@dhis2/d2-i18n` declares a compatible range and `yarn start` still works. ⚠️ i18next 19 is EOL, so holding here indefinitely is itself a risk; revisit on the next `d2-i18n` bump.

### Compatibility pins

#### `@dhis2/cli-app-scripts: 12.11.1`

- **Why:** ⚠️ **Not a security pin — a fixture.** `d2-app-scripts i18n extract` changed behaviour between 12.11.1 and 12.11.3: the newer release appends `__MANIFEST_APP_TITLE` and `__MANIFEST_APP_DESCRIPTION` entries to `i18n/en.pot`, and they end up in the shipped `src/locales/*/translations.json`. This project has no `d2.config.js` and generates its manifest through `d2-manifest`, so those strings are meaningless here and nothing ever reads them. Pinning to 12.11.1 keeps the generated output clean.
- **Fixes:** Nothing — output correctness only.
- **Drop when:** DHIS2 confirms whether the manifest strings can be suppressed without a `d2.config.js`, or a later release stops emitting them for projects that have none. Verify by regenerating and checking `grep MANIFEST i18n/en.pot` is empty.

### Security pins (added 2026-07-30)

#### `axios: ^1.18.0`

- **Why:** Transitive only — no direct dependency declares `axios`, so this resolution is the sole control on the version. It was pinned at exactly `1.13.5` in `8a8d2b4`, and by July 2026 that version carried 10 open high-severity advisories: the pin added to fix a vulnerability had become one. The `^` range lets patches land on their own — it resolves to `1.19.0` today with nobody touching it.
- **Fixes:** GHSA-hfxv-24rg-xrqf, GHSA-j5f8-grm9-p9fc, GHSA-p92q-9vqr-4j8v, GHSA-35jp-ww65-95wh, GHSA-777c-7fjr-54vf, GHSA-6chq-wfr3-2hj9, GHSA-pf86-5x62-jrwf, GHSA-pmwg-cvhr-8vh7, GHSA-q8qp-cvcw-x6jj, GHSA-3g43-6gmg-66jw (10 high) plus 17 medium. Runtime-reachable — credential leakage to redirect targets and proxy-header forwarding.
- **Drop when:** No transitive consumer requests `axios < 1.18`. Verify with `yarn why axios`.

#### `form-data: ^4.0.6`

- **Why:** Transitive only, via `@eyeseetea/d2-api` and `jsdom`. Pinned at exactly `4.0.4` in `8a8d2b4`, which blocked the 4.x fix line.
- **Fixes:** GHSA-hmw2-7cc7-3qxx (high) — CRLF injection via unescaped multipart field names and filenames.
- **Drop when:** No consumer requests `form-data < 4.0.6`.

#### `lodash: ^4.18.0`

- **Why:** ⚠️ **Re-added after being removed.** Commit `6c039e3` on `infra/ai-reference` removed the pin intending to "upgrade to latest lodash", but lodash is not a direct dependency here: without the pin it resolved _down_ to `4.17.21`, because `@eyeseetea/d2-api@1.21.0` and `@eyeseetea/d2-ui-components@2.12.0` both request that exact version. Every other consumer asks for a range satisfied by 4.18.x, and `yarn why` shows a single major line, so a global pin is safe.
- **Fixes:** GHSA-r5fr-rjxr-66jc (high) — code injection via `_.template` import key names.
- **Drop when:** `@eyeseetea/d2-api` and `@eyeseetea/d2-ui-components` stop pinning lodash exactly. Both are EyeSeeTea-owned — fixing them upstream removes this pin from every app.

#### `minimatch: ^10.2.6`

- **Why:** `brace-expansion` 1.1.18 and 2.1.4 carry GHSA-mh99-v99m-4gvg, which is fixed only in 5.0.8. They cannot be pinned directly — see "Rejected pins". Fixing the parent works instead: **minimatch 10 is the first line to request `brace-expansion ^5.0.8`** (3.x wants `^1.1.7`; 5.x, 7.x and 9.x want `^2.0.x`). Pinning every minimatch to `^10` collapses the tree onto a single healthy `brace-expansion@5.0.9`. Consumers are all dev tooling: `@eslint/config-array`, `@eslint/eslintrc`, `jake` and `archiver` via the build, and `depcheck`.
- **Fixes:** GHSA-mh99-v99m-4gvg (high) — DoS via unbounded expansion length.
- **⚠️ Note:** upgrading ESLint does **not** remove these findings, contrary to what looks intuitive. eslint 9.39.5 still pulls minimatch 3.x through `@eslint/config-array` and `@eslint/eslintrc`. Verified on this branch before settling on the minimatch pin.
- **Drop when:** No consumer requests a minimatch line below 10. Verify with `yarn why minimatch`.

#### `esbuild: ^0.28.1`

- **Why:** Three esbuild lines survive the vite migration: 0.28.1 (vite 7), 0.28.0 (`tsx`, which requests `~0.28.0`) and 0.25.12 (vite 6, pinned for `@dhis2/cli-app-scripts`). Only the first is patched, and one major line covers every consumer, so a global pin is the right shape.
- **Fixes:** GHSA-g7r4-m6w7-qqqr. ⚠️ **`low` in the GitHub advisory database** — Dependency-Track scores it above 7 and reports it as high. Pinned because the CI gate follows Dependency-Track, not because the risk is high.
- **Drop when:** `tsx` and vite 6 request `esbuild ^0.28.1` or later natively.

#### `tmp: ^0.2.7`

- **Why:** `vite-bundle-visualizer` requests `^0.2.1` and `external-editor` (via the DHIS2 CLI chain) requests `^0.2.6`; both resolve below the fix. One major line in the tree, so a global pin is correct. Dev/build-only.
- **Fixes:** GHSA-7c78-jf6q-g5cm (high) — type-confusion bypass of `_assertPath` allowing path traversal.
- **Drop when:** No consumer resolves below 0.2.7.

#### `@dhis2/cli-helpers-engine/tar: ^7.5.19`

- **Why:** `@dhis2/cli-helpers-engine@3.2.2` — the latest — requests `tar@^4.4.8`, which resolves to `4.4.19`. Scoped to that parent so the rest of the tree, already on tar 7.x via `node-gyp`, is untouched. Dev/build-only: this is the CLI framework underneath `d2-app-scripts i18n`.
- **Fixes:** GHSA-23hp-3jrh-7fpw (critical), plus GHSA-8x88-c5mf-7j5w, GHSA-34x7-hfp2-rc4v, GHSA-83g3-92jg-28cx, GHSA-8qq5-rm4j-mr97, GHSA-9ppj-qmqm-q256, GHSA-qffp-2rhf-9h96, GHSA-r6q2-hw4h-h46w (high).
- **Drop when:** `@dhis2/cli-helpers-engine` moves off the tar 4.x line. Verify with `yarn why tar`.

#### `@dhis2/cli-app-scripts/vite: ^6.4.3`

- **Why:** `@dhis2/cli-app-scripts@12.11.3` requests `vite@^5.2.9`, and the vite 5.x line has no fix for GHSA-fx2h-pf6j-xcff. Scoped to that parent so the application's own vite 7 is untouched. Dev/build-only.
- **Fixes:** GHSA-fx2h-pf6j-xcff (high) — `server.fs.deny` bypass on Windows.
- **Drop when:** `@dhis2/cli-app-scripts` requests vite 6 or later natively.

#### `execa@npm:0.7.0/cross-spawn: ^6.0.6`

- **Why:** `term-size@1.2.0` → `execa@0.7.0` → `cross-spawn@^5.0.1` → `5.1.0`. The other `execa` in the tree (5.1.1) already resolves `cross-spawn@7.0.6` and must not be dragged down, so a parent-name pin is not enough — this is scoped to the 0.7.0 parent specifically. Dev/build-only, part of the DHIS2 CLI chain.
- **Fixes:** GHSA-3xgq-45jj-v275 (high) — ReDoS.
- **⚠️ Decay risk: HIGH.** Exact-version parent. If `execa@0.7.0` is ever bumped, this pin silently matches nothing and the finding returns with no warning from yarn. Re-check with `yarn why cross-spawn` at every audit.
- **Drop when:** `term-size`/`execa@0.7.0` leaves the tree, which happens when the DHIS2 CLI chain updates.

#### `styled-jsx/loader-utils: ^1.4.2`

- **Why:** `styled-jsx@4.0.1` (pulled by the DHIS2 CLI chain) requests `loader-utils` at exactly `1.2.3`. `babel-loader` and `@pmmmwh/react-refresh-webpack-plugin` sit on a healthy `2.0.4`; the scoped pin fixes the broken branch and leaves them alone. A global pin would rewrite all of them for no benefit. Build-time only.
- **Fixes:** GHSA-76p3-8jx3-jpfq (critical) — prototype pollution; GHSA-3rfm-jhwj-7488, GHSA-hhq3-ff78-jv3g (high) — ReDoS.
- **Drop when:** `styled-jsx@4.x` leaves the tree, or its consumer moves to `loader-utils` 2.x.

#### `i18next-conv/node-gettext: ^3.0.1`

- **Why:** `i18next-conv@9.2.1` requests `node-gettext@^2.0.0`, which resolves to the vulnerable `2.1.0`. ⚠️ **The advisory looks unfixable and is not.** GHSA-g974-hxvm-x689 declares no `first_patched_version`, so tooling reports it as having no fix — but its affected range is `<= 3.0.0`, and **3.0.1 is published and outside that range**. Always compare the affected range against the published version list before concluding a finding is a dead end. Scoped to the parent; dev/build-only, used during i18n generation.
- **Fixes:** GHSA-g974-hxvm-x689 (high) — prototype pollution.
- **Drop when:** `i18next-conv` requests `node-gettext@^3.0.1` or later natively, or drops it. Verify with `yarn why node-gettext`.

#### `react-linkify/linkify-it: ^5.0.2`

- **Why:** `react-linkify@1.0.0-alpha` requests `linkify-it@^2.0.3`, and the 2.x line has no fix. `@eyeseetea/d2-ui-components` requests react-linkify at an exact version, and `2.13.0-beta.6` still does, so upgrading that library does not help. react-linkify is unmaintained since 2022 and written against the linkify-it 2 API, so this pin was **checked rather than assumed**: linkify-it 5 still ships a callable CJS export, `.tlds()` and `.match()` behave the same, and rendering `<Linkify>` in jsdom produces the expected `<a href>`. Scoped to react-linkify so `markdown-it`'s own linkify-it, already on 5.0.2, is untouched.
- **Fixes:** GHSA-v245-v573-v5vm, GHSA-22p9-wv53-3rq4 (high) — quadratic-complexity DoS.
- **Drop when:** `@eyeseetea/d2-ui-components` drops or replaces `react-linkify`. EyeSeeTea-owned, so fixable upstream — and that would remove this pin from every app.

#### `qs: ^6.15.3`

- **Why:** this entry was inherited from `8a8d2b4` as the exact version `6.14.2`, and **that exact version had itself become the vulnerable one** — GHSA-q8mj-m7cp-5q26 affects `>= 6.11.1 <= 6.15.1`, and 6.15.2 was published after the pin was written. A textbook decay: the pin was a floor written as a fixture, so it held the tree _at_ the advisory instead of above it. Converted to a `^` range, which is what a security floor should always have been. Three parents request it — `request` (build-only), `url` via the browser polyfills, and `@eyeseetea/d2-api`, which is **runtime**, so this was verified with the test suite and a build rather than with `yarn install` alone.
- **Fixes:** GHSA-q8mj-m7cp-5q26 (medium) — unhandled `TypeError` in `qs.stringify` with `arrayFormat: 'comma'` and `encodeValuesOnly: true` over an array containing `null`.
- **Drop when:** every consumer requests `qs >= 6.15.2` natively. `request` is the blocker — it requests `~6.5.2` and is deprecated, so this pin outlives the others in the `@dhis2/cli-app-scripts` chain.

---

## Rejected pins

Tried during this pass, verified to break a consumer, and reverted. Recorded so nobody re-tries them.

| Pin attempted                      | What broke                                                                                                                                                                                      |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `brace-expansion: ^5.0.9` (global) | `minimatch@3.x` dies with `TypeError: expand is not a function` — v5 switched from a default export to a named one. Fixed by pinning `minimatch: ^10` instead.                                  |
| `request/uuid: ^11.1.1`            | `ERR_PACKAGE_PATH_NOT_EXPORTED` — `request` does `require('uuid/v4')`, and the `./v4` subpath was removed in uuid v7. No uuid version both fixes the advisory (11.1.1+) and keeps that subpath. |

---

## Known findings with no fix available

Recorded here rather than in `resolutions` because **no version resolves them**.

#### `uuid@3.4.0` — GHSA-w5hq-g745-h8pq

- **Chain:** `@dhis2/cli-app-scripts` → `@dhis2/cli-helpers-engine@3.2.2` → `request@2.88.2` → `uuid@^3.3.2`.
- **Why it cannot be pinned:** see "Rejected pins" — the fix and the API `request` needs never overlap.
- **Why it is not exploitable here:** the advisory affects the `v3()`, `v5()` and `v6()` methods **when the caller supplies an output buffer**; `v4()` explicitly throws `RangeError` and is unaffected. `request` does `require('uuid/v4')` and calls `uuid()` with no arguments. Dev/build-only regardless — this chain runs during `yarn localize`, never in the browser bundle.
- **Severity note:** `medium` in the GitHub advisory database; Dependency-Track scores it above 7. It is the branch's only remaining high **and its only newly-introduced instance**, so the CI gate will flag the PR.
- **Drop when:** `@dhis2/cli-helpers-engine` stops depending on `request`, which has been deprecated since 2020.

_(`node-gettext` was in this section until it turned out to be fixable — see the pin below.)_

---

## Decay-monitoring checklist

When running `/sca-triage`, treat any of these as a signal that a pin has gone stale:

- A finding of **any severity** reappears for a package that has an active resolution. Do not filter this check to critical/high: `qs` was pinned to the exact version that later became the vulnerable one, and the finding sat at medium for months because nothing was looking below the gate's threshold.
- `yarn why <pkg>` shows the resolved version _not matching_ the right-hand side of the resolution.
- `yarn why execa` no longer shows `0.7.0` — the `execa@npm:0.7.0/cross-spawn` pin is then a no-op and must be re-pointed or removed.
- One of the prune candidates above no longer needs its pin. Remove it, reinstall, and confirm nothing reappears; if a finding comes back, restore the pin and record here what blocked it.

## Future improvements

- **Upgrade `react-router-dom` off v5**, which would drop the `path-to-regexp` pin.
- **Ask DHIS2 whether `@dhis2/cli-app-scripts` can ship i18n without the full CLI framework.** Six of the pins above exist only because `@dhis2/cli-helpers-engine` comes along for the ride: it brings `request` (deprecated), `tar`, `inquirer` and `update-notifier` in order to extract translation strings.
- **Fix `@eyeseetea/d2-api` and `@eyeseetea/d2-ui-components` upstream.** Between them they force the `lodash` and `react-linkify` pins into every app that uses them.
