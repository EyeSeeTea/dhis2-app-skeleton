# Yarn Resolutions

This file documents every entry in the `resolutions` block of `package.json`. Each entry should answer three questions: **what is being pinned**, **why it exists**, and **when it can be removed**.

`package.json` doesn't allow comments, so this file is the only place that knowledge lives. **If you add or remove a resolution, update this file in the same commit.**

## Conventions

- **`^` range or exact version? Ask what the number is asserting.**

    A **floor** — "never below this" — takes a `^` range. Almost every security pin is a floor: it does not matter whether axios resolves to 1.18.0 or 1.19.0, only that it is not 1.13.5. Newer is strictly better, so let it land.

    A **fixture** — "exactly this" — takes an exact version. These are compatibility constraints, not security ones: something else binds to that specific release. `@types/react` and `i18next` below are the two in this file.

    The two failure modes are mirror images. An exact version where a floor belonged **decays**: `axios: 1.13.5` was correct in February and carried 10 open high-severity advisories by July, because no patch could ever land. Decay has a nastier form still — `qs: 6.14.2` was written to fix an advisory, and a later advisory landed on 6.14.2 itself, so the pin ended up holding the whole tree _at_ the vulnerable version rather than above it. A `^` range where a fixture belonged **surprises**: `@dhis2/cli-app-scripts: ^12` resolved to 12.11.3, which silently started injecting `__MANIFEST_APP_*` entries into the translation bundle.

    In practice: is there a higher version that would also work? Then use `^`. Does something bind to this exact release? Then pin it — **and write the condition for unpinning it.** If you cannot state that condition, it should probably have been a `^` range.

- Prefer **per-parent** paths (`parent/child`) over standalone descriptors. Yarn-berry only matches a standalone descriptor on exact text — `picomatch@npm:^4` will _not_ match a child request of `^4.0.2`. The reliable forms are `parent/child`, `parent@npm:<exact-version>/child`, or `parent@npm:^<major>/child`.
- **Versioned-parent pins go stale silently.** When a parent patch-bumps, `parent@npm:<exact>/child` matches nothing and yarn does not warn. There is no entry of that shape in this file today; if you add one, mark it as a decay risk and re-check it at every audit.
- **A pin that clears the scanner but breaks a consumer is not a fix.** Two pins were tried and reverted during this pass — see "Rejected pins" below. Verify with the tool that actually uses the package, not just `yarn install`.

## Audit cadence

Re-audit the dependency tree monthly, and before every release. A resolution that has silently stopped working shows up as a finding that keeps coming back for a package that already has a pin. Each entry below has a **drop when** condition — when that condition becomes true, delete the entry and re-install.

Note that `yarn npm audit` and Dependency-Track disagree on severity — `esbuild` and `uuid` are scored below 7 by the GitHub advisory database and above 7 by Dependency-Track. **The CI gate follows Dependency-Track**, so measure there before concluding an app is clean, and never quote a before/after count that mixes the two sources.

---

## Active resolutions

### Pre-existing (rationale not recovered)

All added in a single commit, `8a8d2b4` ("fix(security): mitigate dependency vulnerabilities", 2026-02-26), with no recorded rationale.

**The prune was carried out on 2026-08-05 and the table is now empty.** Each of the five entries was removed, the tree re-installed, and the _resolved versions_ compared — four turned out to change nothing that mattered and were retired; one was load-bearing and became a range. See [Removed](#removed).

The lesson worth keeping from that batch: **"prune candidate" and "does nothing" are not the same claim.** Of the five, the one the table described most dismissively was the only one holding a vulnerable version out of the tree.

#### `@types/react: 18.2.22` and `@types/react-dom: 18.2.7`

- **Why:** ⚠️ **Not security pins.** They force every transitive consumer onto the React 18 type definitions; several `@dhis2/*` and Material-UI packages peer on `@types/react@^17`, and mixing the two breaks `yarn typecheck`. They deliberately mirror the `devDependencies` entries.
- **Fixes:** Nothing — typecheck stability only.
- **Drop when:** No package in the tree requests React 17 types. Verify with `yarn why @types/react`. **Do not remove these as "undocumented pins"** — that is what this entry exists to prevent.

#### `i18next: 19.8.5`

- **Why:** Held at the version `@dhis2/d2-i18n` expects. ⚠️ **Do not change this blind.** Moving off this line has been observed to break app startup with `Uncaught TypeError: i18next.init is not a function`, because `@dhis2/d2-i18n` binds to an older i18next API. The correct version is specific to which `@dhis2/d2-i18n` this app uses, so validate by running the app rather than copying a version from elsewhere.
- **Fixes:** Historic prototype-pollution advisories in the older i18next lines.
- **Drop when:** `@dhis2/d2-i18n` declares a compatible range and `yarn start` still works. ⚠️ i18next 19 is EOL, so holding here indefinitely is itself a risk; revisit on the next `d2-i18n` bump.

### Security pins (added 2026-07-30)

#### `axios: ^1.18.0`

- **Why:** Transitive only — no direct dependency declares `axios`, so this resolution is the sole control on the version. It was pinned at exactly `1.13.5` in `8a8d2b4`, and by July 2026 that version carried 10 open high-severity advisories: the pin added to fix a vulnerability had become one. The `^` range lets patches land on their own — it resolves to `1.19.0` today with nobody touching it.
- **Fixes:** GHSA-hfxv-24rg-xrqf, GHSA-j5f8-grm9-p9fc, GHSA-p92q-9vqr-4j8v, GHSA-35jp-ww65-95wh, GHSA-777c-7fjr-54vf, GHSA-6chq-wfr3-2hj9, GHSA-pf86-5x62-jrwf, GHSA-pmwg-cvhr-8vh7, GHSA-q8qp-cvcw-x6jj, GHSA-3g43-6gmg-66jw (10 high) plus 17 medium. Runtime-reachable — credential leakage to redirect targets and proxy-header forwarding.
- **Drop when:** No transitive consumer requests `axios < 1.18`. Verify with `yarn why axios`.

#### `node-fetch: ^2.6.7`

- **Why:** ⚠️ **Load-bearing, despite having been listed as a prune candidate.** Removing it puts `node-fetch@1.7.3` back in the tree, via a consumer that requests `^1.0.1`. The advisory's 1.x fix is on 2.6.7, so the 1.x range cannot reach it and this global floor is what lifts that consumer onto a patched line. Verified by removing it and re-installing: `1.7.3` reappears.
- **Fixes:** GHSA-r683-j2x4-v87g (high) — secure headers forwarded to untrusted sites across a cross-host redirect.
- **Was an exact version until 2026-08-05, and that was the wrong shape.** `cross-fetch@^4.0.0` declares `node-fetch@^2.7.0`, so the exact `2.6.7` held that consumer _below_ the range its own parent declares, and no later patch could ever be selected. As a floor it resolves to 2.7.0, still removes `1.7.3`, and lets future patches land unaided. This is the file's own floor-versus-fixture rule applied to an entry that predates it.
- **Drop when:** no consumer requests a `node-fetch` range whose lowest satisfying version is below 2.6.7 — concretely, when the `^1.0.1` consumer is gone. Verify by removing it, re-installing and confirming no 1.x appears.

#### `lodash: ^4.18.0`

- **Why:** ⚠️ **Re-added after being removed.** Commit `6c039e3` on `infra/ai-reference` removed the pin intending to "upgrade to latest lodash", but lodash is not a direct dependency here: without the pin it resolved _down_ to `4.17.21`, because `@eyeseetea/d2-api@1.21.0` and `@eyeseetea/d2-ui-components@2.12.0` both request that exact version. Every other consumer asks for a range satisfied by 4.18.x, and `yarn why` shows a single major line, so a global pin is safe.
- **Fixes:** GHSA-r5fr-rjxr-66jc (high) — code injection via `_.template` import key names.
- **Drop when:** `@eyeseetea/d2-api` and `@eyeseetea/d2-ui-components` stop pinning lodash exactly. Both are EyeSeeTea-owned — fixing them upstream removes this pin from every app.

#### `i18next-conv/node-gettext: ^3.0.1`

- **Why:** `i18next-conv@9.2.1` requests `node-gettext@^2.0.0`, which resolves to the vulnerable `2.1.0`. ⚠️ **The advisory looks unfixable and is not.** GHSA-g974-hxvm-x689 declares no `first_patched_version`, so tooling reports it as having no fix — but its affected range is `<= 3.0.0`, and **3.0.1 is published and outside that range**. Always compare the affected range against the published version list before concluding a finding is a dead end. Scoped to the parent; dev/build-only, used during i18n generation.
- **Fixes:** GHSA-g974-hxvm-x689 (high) — prototype pollution.
- **Drop when:** `i18next-conv` requests `node-gettext@^3.0.1` or later natively, or drops it. Verify with `yarn why node-gettext`.

#### `react-linkify/linkify-it: ^5.0.2`

- **Why:** `react-linkify@1.0.0-alpha` requests `linkify-it@^2.0.3`, and the 2.x line has no fix. `@eyeseetea/d2-ui-components` requests react-linkify at an exact version, and `2.13.0-beta.6` still does, so upgrading that library does not help. react-linkify is unmaintained since 2022 and written against the linkify-it 2 API, so this pin was **checked rather than assumed**: linkify-it 5 still ships a callable CJS export, `.tlds()` and `.match()` behave the same, and rendering `<Linkify>` in jsdom produces the expected `<a href>`. Scoped to react-linkify so `markdown-it`'s own linkify-it, already on 5.0.2, is untouched.
- **Fixes:** GHSA-v245-v573-v5vm, GHSA-22p9-wv53-3rq4 (high) — quadratic-complexity DoS.
- **Drop when:** `@eyeseetea/d2-ui-components` drops or replaces `react-linkify`. EyeSeeTea-owned, so fixable upstream — and that would remove this pin from every app.

#### `qs: ^6.15.3`

- **Why:** this entry was inherited from `8a8d2b4` as the exact version `6.14.2`, and **that exact version had itself become the vulnerable one** — GHSA-q8mj-m7cp-5q26 affects `>= 6.11.1 <= 6.15.1`, and 6.15.2 was published after the pin was written. A textbook decay: the pin was a floor written as a fixture, so it held the tree _at_ the advisory instead of above it. Converted to a `^` range, which is what a security floor should always have been. It is requested by `url` via the browser polyfills and by `@eyeseetea/d2-api`, which is **runtime**, so this was verified with the test suite and a build rather than with `yarn install` alone.
- **Fixes:** GHSA-q8mj-m7cp-5q26 (medium) — unhandled `TypeError` in `qs.stringify` with `arrayFormat: 'comma'` and `encodeValuesOnly: true` over an array containing `null`.
- **Drop when:** every consumer requests `qs >= 6.15.2` natively. `@eyeseetea/d2-api` is the blocker: it requests the exact version `6.9.7`, so removing this pin resolves `qs` _downwards_ rather than upwards — verified by removing it and re-installing.

---

## Removed

> **The test is whether a resolved version moves, not whether the lockfile changes.** A byte-identical lockfile proves an entry did nothing, but the reverse does not hold: an entry can rewrite a descriptor, change the lockfile, and still leave every installed version exactly where it was. `path-to-regexp` below is that case, and it is the reason this section states the criterion explicitly.

Four entries retired on 2026-08-05, each tested by removing it, re-installing and comparing resolved versions. All the versions that resulted are outside every advisory affecting them, checked against the published advisory database rather than assumed.

### `path-to-regexp: 1.9.0` — removed 2026-08-05

**Inert.** `react-router@5.3.4` declares `path-to-regexp@^1.7.0`, and 1.9.0 is the last release of the 1.x line, so that range already resolves to 1.9.0 unaided.

|                | Descriptor                  | Resolved |
| -------------- | --------------------------- | -------- |
| With the entry | `path-to-regexp@npm:1.9.0`  | 1.9.0    |
| Without        | `path-to-regexp@npm:^1.7.0` | 1.9.0    |

Note what this case demonstrates: the entry **does** change the lockfile — the descriptor differs — so a byte-identical comparison reports it as load-bearing. Only comparing resolved versions shows it was not. This entry was previously cited, here and elsewhere, as the example of a constraint that binds in this repository and matches nothing in an application that copied it. The second half was right; the first was not.

**Restore it only if** `react-router` moves to a range that admits a 1.x release below 1.9.0, which would mean going backwards.

### `glob-parent: 5.1.2` — removed 2026-08-05

**Not needed, and the advisory range recorded against it was wrong.** The note said "ReDoS in `< 5.1.2`". The actual range is `>= 4.0.0, < 5.1.2`:

```bash
gh api advisories/GHSA-ww39-953v-wcq6 --jq '.vulnerabilities[]
  | select(.package.name=="glob-parent") | "\(.vulnerable_version_range) -> \(.first_patched_version)"'
#  >= 4.0.0, < 5.1.2 -> 5.1.2
```

That difference decides this case, because the tree has a consumer on the 3.x line. Under the range as recorded it looks affected; under the real range it is below the floor and outside it. Without the entry, three lines coexist and all three are clean: 3.1.0 (below the affected range), 5.1.2 (patched), and 6.0.2 — above 6.0.1, which patches the separate `GHSA-cj88-88mr-972w` affecting exactly `= 6.0.0`.

The global entry was also pulling `eslint` down from the `^6.0.2` it declares.

### `nanoid: 3.3.8` — removed 2026-08-05

**Was holding a consumer below its declared range.** `postcss` requests `nanoid@^3.3.16`; the exact `3.3.8` forced it eight patches below that. Without the entry it resolves to 3.3.17, clean.

### `@babel/runtime: 7.26.10` — removed 2026-08-05

**Only held the tree back.** Every consumer declares a `^7.x` range admitting far newer releases. Without the entry it resolves to 7.29.7, clean.

### `form-data: ^4.0.6` — removed 2026-08-05

**Inert.** Parents declare `^4.0.0` (×2) and `^4.0.6`; all reach 4.0.6 on their own, so the resolved version is 4.0.6 with or without the entry. It was correct when written — it replaced an exact `4.0.4` that blocked the fix line — but re-resolution now reaches the patch unaided.

---

## Rejected pins

Tried during this pass, verified to break a consumer, and reverted. Recorded so nobody re-tries them.

| Pin attempted                      | What broke                                                                                                                                                                                                                                    |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `brace-expansion: ^5.0.9` (global) | `minimatch@3.x` dies with `TypeError: expand is not a function` — v5 switched from a default export to a named one. Do not force one brace-expansion line across the tree; each minimatch major has its own, and all three are patched today. |
| `request/uuid: ^11.1.1`            | `ERR_PACKAGE_PATH_NOT_EXPORTED` — `request` does `require('uuid/v4')`, and the `./v4` subpath was removed in uuid v7. No uuid version both fixes the advisory (11.1.1+) and keeps that subpath.                                               |

#### Considered and dropped: `minimatch: ^10.2.6`

Held on this branch from 2026-07-30 and removed on 2026-08-03, before merge. Recorded because the reasoning is invisible in the tree by definition — the pin is not there to be found.

- **What it was for:** when it was written, GHSA-mh99-v99m-4gvg (high) recorded a single patched version, `brace-expansion@5.0.8`, so the 1.x and 2.x lines both read as unfixable — and pinning `brace-expansion` directly breaks `minimatch@3.x` (see the table above). Forcing every minimatch onto the 10.x line, the first to request `brace-expansion ^5.0.8`, collapsed the tree onto a healthy version.
- **Why it is gone:** the maintainers backported the fix — `brace-expansion@2.1.3` on 2026-07-28 and `1.1.17` on 2026-07-29 — and the advisory was updated to record both on **2026-07-31**. The versions already in this tree, 1.1.18 and 2.1.4, are above both. Without the pin, `minimatch@3.1.5 → brace-expansion@1.1.18`, `5.1.9`/`7.4.9`/`9.0.9 → 2.1.4`, and `10.2.6 → 5.0.9`. All three lines are patched against every open brace-expansion advisory, and `yarn npm audit --severity high -R` returns no suggestions.
- **The lesson, which is why this entry exists:** the conclusion _"no fix on this line"_ came from advisory metadata, not from the registry — the backports were published two and three days before the advisory recorded them. **Check the affected range against the published version list, not only `first_patched_version`.** That is the same check that rescued `node-gettext`, applied to a field that was filled in rather than empty.
- **Related, worth keeping:** upgrading ESLint does not remove the minimatch 3.x chain while on the 9.x line — `eslint@9.39.5` declares `minimatch ^3.1.5` itself, and reaches it again through `@eslint/eslintrc@3.3.6` and `@eslint/config-array@0.21.2`. **eslint 10** is where that changes: 10.8.0 drops `@eslint/eslintrc` and moves to `minimatch ^10.2.5`.

---

## Known findings with no fix available

Recorded here rather than in `resolutions` because **no version resolves them**.

#### `elliptic@6.6.1` — GHSA-848j-6mx2-7j84

- **Chain:** `vite-plugin-node-polyfills` → `node-stdlib-browser` → `crypto-browserify` → `browserify-sign` and `create-ecdh`.
- **Why it cannot be fixed:** the advisory covers **all versions `<= 6.6.1`**, and 6.6.1 is the latest published release. There is nothing to pin to — verified against the published version list, the check that rescued `node-gettext`.
- **Impact:** the ECDSA signing path is never reached. The polyfills exist only because `md5.js` needs the `Buffer` shim.
- **Drop when:** `elliptic` publishes a fix, or `md5.js` is replaced and the polyfill chain leaves the tree entirely.

_(`node-gettext` was in this section until it turned out to be fixable — see the pin above.)_

---

## Decay-monitoring checklist

When auditing, treat any of these as a signal that a pin has gone stale:

- A finding of **any severity** reappears for a package that has an active resolution. Do not filter this check to critical/high: `qs` was pinned to the exact version that later became the vulnerable one, and the finding sat at medium for months because nothing was looking below the gate's threshold.
- `yarn why <pkg>` shows the resolved version _not matching_ the right-hand side of the resolution.
- **A pin that holds a consumer below its declared range.** Compare the resolution against what the parents actually request: `grep -E '^\s+<pkg>: "npm:' yarn.lock | sort | uniq -c`. If a parent declares `^3.3.16` and the pin forces `3.3.8`, the pin is not protecting anything — it is overriding a package's own compatibility statement, and it cannot receive patches either. Two entries were retired on exactly this signal.
- **A pin whose removal changes nothing.** Delete it, reinstall, and compare **the resolved versions** — not the lockfile bytes. A byte-identical lockfile proves the pin matched no descriptor, but the reverse does not hold: a pin can rewrite a descriptor, change the lockfile, and still leave every installed version where it was. `path-to-regexp` was retired on that basis and would have survived a byte comparison. Pins copied between repositories are the usual source, but as that case shows, a pin can be inert in the tree it was written for.

---

## Why the archived i18n packages are still here

`@dhis2/d2-i18n-extract` and `@dhis2/d2-i18n-generate` are archived upstream and will never receive a fix. `@dhis2/cli-app-scripts` is the maintained equivalent, and replacing them was implemented on this branch and then reverted. The reasoning is recorded here because a remediation that was tried and rejected leaves no trace in the tree.

**What the replacement costs.** `@dhis2/cli-app-scripts` cannot provide translation extraction without the DHIS2 CLI framework beneath it, so adopting it for i18n alone pulls in the whole chain. Measured on this branch, that chain was responsible for **every one of these**:

| Brought in by the CLI chain                          | Consequence                                                                                                                                                                                                       |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `request@2.88.2` → `uuid@3.4.0`                      | A finding with **no fix in any published version**. `request` has been deprecated since 2020, and no `uuid` release satisfies both the advisory and the `uuid/v4` subpath `request` imports — see "Rejected pins" |
| `@dhis2/cli-helpers-engine` → `tar@4.4.19`           | Needed a scoped pin                                                                                                                                                                                               |
| `external-editor` → `tmp@0.0.33`                     | Needed a global pin                                                                                                                                                                                               |
| `execa@0.7.0` → `cross-spawn@5.1.0`                  | Needed a versioned-parent pin, the shape with the highest decay risk                                                                                                                                              |
| `styled-jsx@4.0.1` → `loader-utils@1.2.3`            | Needed a scoped pin                                                                                                                                                                                               |
| Its own bundled `vite@5.x`                           | Needed a scoped pin, and an `esbuild` pin to go with it                                                                                                                                                           |
| `update-notifier`, `inquirer`, `jest@27`, `jsdom@16` | Four further deferred findings, all build-only                                                                                                                                                                    |
| `d2-app-scripts i18n extract` behaviour change       | Needed an exact-version fixture, because 12.11.3 injects `__MANIFEST_APP_*` strings into `i18n/en.pot`                                                                                                            |

Removing the replacement removed **seven resolutions** and the exact-version fixture along with them, and `tar`, `tmp` and `cross-spawn` then resolve to patched versions unaided. The `esbuild` pin became redundant too: with the CLI's vite gone, `vite@7` requests `^0.27.0 || ^0.28.0` and reaches a patched release on its own.

**Why staying is the better trade today.** The archived packages currently require exactly one constraint — `i18next-conv/node-gettext`, above — and produce no finding beyond it. So the choice is not _abandoned → maintained_; it is _two frozen packages that need one pin_ against _a maintained package that carries an abandoned chain with an unfixable finding and needs seven_. Both toolchains are build-time only: they run during `yarn localize` and never reach the browser bundle, so the difference in real exposure is negligible and the decision rests on maintainability.

Being archived is not the same as being vulnerable — frozen code introduces nothing new either. The exposure here is conditional, not current.

**Adopt `@dhis2/cli-app-scripts` when either becomes true:**

1. `@dhis2/cli-helpers-engine` stops depending on `request`, removing the unfixable `uuid` path. The replacement then costs only scoped pins and the maintainability argument wins outright.
2. Either archived package needs a constraint that cannot be satisfied within the ranges it already requests — that is, both re-resolution and a scoped pin fail.

Re-measure rather than trusting the table above: it is a snapshot, and the replacement tooling moves.

---

## Notes for applications copying this baseline

- **The vite 7 upgrade does not require ESLint 9.** This repository moved to `eslint@9` and flat config in the same pass, but the two are independent: `vite-plugin-checker@0.11.0` supports `vite >=5.4.20` while still accepting `eslint >=7`, and only 0.12.0 raises the floor to `eslint >=9.39.1`. An application on ESLint 8 can take the `vite`/`vitest`/`esbuild` fixes without touching its linter. ESLint 9 is worth doing here on its own merits — ESLint 8 is no longer supported upstream, and `@typescript-eslint@5` does not cover this repository's TypeScript — but it should not be presented as part of the security work, or it inflates the cost of adopting it.
- **Re-verify every pin you copy — including against this tree.** `path-to-regexp: 1.9.0` used to be the example here of a pin that is load-bearing in the skeleton and a no-op in an application that copied it. Only the second half held: in at least one application no `path-to-regexp` existed in the lockfile at all, but when finally tested here it turned out to be inert in this tree too, because `react-router@5.3.4` declares `^1.7.0` and 1.9.0 is the newest 1.x release. It has been retired — see [Removed](#removed). The general lesson survives the example, and gains a second half: a constraint can be inert where it was written, not only where it was copied, and **the check has to compare resolved versions rather than lockfile bytes**, because this one changed the lockfile while changing nothing else.
- **Check the install policy, not just the manifest.** `.yarnrc.yml` here sets `npmMinimalAgeGate: 7d`, `enableScripts: false`, `enableHardenedMode: true` and `checksumBehavior: throw`. Copy these along with the manifest — they are part of the baseline, not incidental local settings.

    **The age gate is the one that most often looks like "there is no fix".** `yarn up -R` reports success and silently selects one patch below the patched release rather than failing, so compare the version you got against the version the advisory names, not against the version you had. If the gate is the blocker, schedule the work — do not lower it, because it is a supply-chain control and weakening it inside a security change trades a real protection for a scanner number.

    **`enableScripts: false` is the one most likely to surprise you.** Yarn reports `YN0004` for each package whose build script it skipped — here `core-js` and `esbuild`. Neither breaks: `esbuild` ships its binary as a platform-specific optional package (`@esbuild/linux-x64` and friends) rather than downloading it in a postinstall, and `core-js`'s script only prints a funding message. A package that genuinely needs its postinstall would fail, so treat a new `YN0004` as something to check rather than as noise.

- **If you upgrade `react-router-dom` off v5, go to v7, not v6.** The v6 line carries advisories whose affected range extends to `< 7.18.0`, and its final release, 6.30.4, is still inside two of them. Stopping at v6 trades one finding for several with no remediation on that line.

## Future improvements

- **Upgrade `react-router-dom` off v5.** Target v7 directly, for the reason above. (This no longer drops a `path-to-regexp` entry — that one was retired as inert — but it does clear the v5 line's own findings.)
- **The install policy is now aligned and should stay that way.** On 2026-08-05 `.yarnrc.yml` was brought level with the application that treats this repository as its reference: `npmMinimalAgeGate` from `0` to `7d`, `enableScripts` from `true` to `false`, and `enableHardenedMode: true` and `checksumBehavior: throw` added. A baseline looser than the apps copying it is the divergence a baseline exists to prevent. Alignment cost nothing measurable — the lockfile came back byte-identical after each change. If a future change needs one of these relaxed, relax it deliberately and record why here, rather than letting the two drift apart again.
- **Ask DHIS2 whether `@dhis2/cli-app-scripts` can ship i18n without the full CLI framework.** That is the condition that would make the maintained i18n tooling adoptable — see the section above.
- **Fix `@eyeseetea/d2-api` and `@eyeseetea/d2-ui-components` upstream.** Between them they force the `lodash` and `react-linkify` pins into every app that uses them.
