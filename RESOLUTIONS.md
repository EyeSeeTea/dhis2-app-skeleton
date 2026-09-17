# Yarn Resolutions

This file documents every entry in the `resolutions` block of `package.json`. Each entry should answer three questions: **what is being pinned**, **why it exists**, and **when it can be removed**.

`package.json` doesn't allow comments, so this file is the only place that knowledge lives. **If you add or remove a resolution, update this file in the same commit.**

## Conventions

- **`^` range or exact version? Ask what the number is asserting.**

    A **floor** ("never below this") takes a `^` range. Almost every security pin is a floor: it does not matter whether axios resolves to 1.18.0 or 1.19.0, only that it is not 1.13.5. Newer is strictly better, so let it land.

    A **fixture** ("exactly this") takes an exact version. These are compatibility constraints, not security ones: something else binds to that specific release. `@types/react` and `i18next` below are the two in this file.

    The two failure modes are mirror images. An exact version where a floor belonged **decays**: an exact `axios: 1.13.5` accumulated 10 open high-severity advisories because no patch could ever land, and an exact `qs: 6.14.2` ended up holding the tree _at_ a version a later advisory covered. A `^` range where a fixture belonged **surprises**: a range on `i18next` would let an install move it off the API `@dhis2/d2-i18n` binds to and break app startup.

    In practice: is there a higher version that would also work? Then use `^`. Does something bind to this exact release? Then pin it, **and write the condition for unpinning it.** If you cannot state that condition, it should probably have been a `^` range.

- **A floor has to name the version that fixes every advisory it covers.** Take the highest patched version on the line, not the first one found. `tmp` has a high advisory fixed in 0.2.6 and another affecting exactly `>= 0.2.6, < 0.2.7`, so `^0.2.6` would admit a vulnerable release and the floor is `^0.2.7`.
- Prefer **per-parent** paths (`parent/child`) over standalone descriptors. Yarn-berry only matches a standalone descriptor on exact text: `picomatch@npm:^4` will _not_ match a child request of `^4.0.2`. The reliable forms are `parent/child` and `parent@npm:<exact-version>/child`.
- **The version in a versioned-parent path is the _resolved_ version, not a descriptor.** Measured on Yarn 4.15.0 and 4.12.0: `glob@npm:7.2.3/minimatch: 3.1.2` binds and moves glob 7's `minimatch` to 3.1.2, while `glob@npm:^7.1.3/minimatch: 3.1.2` does nothing, even though `^7.1.3` is one of the descriptors consumers request and 3.1.2 is inside glob's own `^3.1.1`. A range in the parent position matches nothing, and yarn does not warn.
- **A versioned-parent path can select a version outside the range the parent declares.** `execa@npm:0.7.0/cross-spawn: ^6.0.6` resolves `cross-spawn` to 6.0.6 although `execa@0.7.0` declares `^5.0.1`. What decides between the two path forms is what else shares the parent's name: a parent-name path (`execa/cross-spawn`) binds every copy, and this tree also has `execa@5.1.1`, which declares `^7.0.3` and would be dragged below its own range.
- **Versioned-parent pins go stale silently.** When the parent moves to another version, `parent@npm:<exact>/child` matches nothing and yarn does not warn. `execa@npm:0.7.0/cross-spawn` is the one entry of that shape in this file; re-check it at every audit.
- **Prefer re-resolution to a new constraint.** Most transitive findings are a stale lockfile rather than a missing fix: the declared range already admits the patched release and `yarn up -R <package>` reaches it with no manifest change. Reach for a resolution only once that has been shown to fail, and after checking whether a newer release of the parent already selects a patched version.
- **Removing a constraint is not the same as upgrading it away.** For a package no direct dependency requests, deleting the entry hands version selection back to the parents, and a parent may be the reason the old version was there. Some packages resolve _downwards_ when their entry is removed.
- **Test a constraint by removing it, re-installing and comparing the _resolved versions_**, not the lockfile bytes. A constraint can rewrite a descriptor, change the lockfile, and leave every installed version exactly where it was.
- **When a returning version looks alarming, check the advisory's range before keeping the pin.** An older version coming back is not by itself a reason to keep a constraint: `glob-parent@3.1.0` comes back without a `glob-parent` entry, and `GHSA-ww39-953v-wcq6` affects `>= 4.0.0, < 5.1.2`, so it was never in range.
- **Validate the control before trusting a zero from the advisories API.** `gh api "advisories?ecosystem=npm&affects=<pkg>@<version>"` returns nothing both for a clean version and for one that was never published. `glob-parent@5.0.0` looks like a known-vulnerable control and returns nothing, because it does not exist; `glob-parent@5.1.1` is a valid one.
- **A pin that clears the scanner but breaks a consumer is not a fix, and loading the consumer is not enough to tell.** Call the code path that uses the package. `package-json/got: ^11.8.5` loads cleanly and fails on the first request; see "Rejected pins" below.

## Audit cadence

Re-audit the dependency tree monthly, before every release, and again immediately before requesting review on a change that claims a clean gate: a verification table goes stale when an advisory is published *or widened*, not when the tree changes. Run it over the whole tree (`yarn npm audit --recursive`), not only the packages named in this file. A resolution that has silently stopped working shows up as a finding that keeps coming back for a package that already has a pin. Each entry below has a **drop when** condition; when that condition becomes true, delete the entry and re-install.

Note that `yarn npm audit` and Dependency-Track disagree on severity: `uuid` is scored medium by the GitHub advisory database and high by Dependency-Track, and Dependency-Track keeps reporting some advisories GitHub has withdrawn. **The CI gate follows Dependency-Track**, so measure there before concluding an app is clean, and never quote a before/after count that mixes the two sources.

---

## Active resolutions

### Compatibility fixtures

#### `@types/react: 18.2.22` and `@types/react-dom: 18.2.7`

- **Why:** ⚠️ **Not security pins.** They force every transitive consumer onto the React 18 type definitions; several `@dhis2/*` and Material-UI packages peer on `@types/react@^17`, and mixing the two breaks `yarn typecheck`. They deliberately mirror the `devDependencies` entries.
- **Fixes:** Nothing; typecheck stability only.
- **Drop when:** No package in the tree requests React 17 types. Verify with `yarn why @types/react`. **Do not remove these as "undocumented pins"**: that is what this entry exists to prevent.

#### `i18next: 19.8.5`

- **Why:** Held at the version `@dhis2/d2-i18n` expects. ⚠️ **Do not change this blind.** Moving off this line has been observed to break app startup with `Uncaught TypeError: i18next.init is not a function`, because `@dhis2/d2-i18n` binds to an older i18next API. The correct version is specific to which `@dhis2/d2-i18n` this app uses, so validate by running the app rather than copying a version from elsewhere.
- **Fixes:** Historic prototype-pollution advisories in the older i18next lines.
- **Drop when:** `@dhis2/d2-i18n` declares a compatible range and `yarn start` still works. ⚠️ i18next 19 is EOL, so holding here indefinitely is itself a risk; revisit on the next `d2-i18n` bump.

### Security pins

#### `axios: ^1.18.0`

- **Why:** Transitive only: no direct dependency declares `axios`, so this resolution is the sole control on the version. A range rather than an exact version, so patches land whenever the lockfile is re-resolved; it resolves to 1.19.0.
- **Fixes:** GHSA-hfxv-24rg-xrqf, GHSA-j5f8-grm9-p9fc, GHSA-p92q-9vqr-4j8v, GHSA-35jp-ww65-95wh, GHSA-777c-7fjr-54vf, GHSA-6chq-wfr3-2hj9, GHSA-pf86-5x62-jrwf, GHSA-pmwg-cvhr-8vh7, GHSA-q8qp-cvcw-x6jj, GHSA-3g43-6gmg-66jw (10 high) plus 17 medium. Runtime-reachable: credential leakage to redirect targets and proxy-header forwarding.
- **Drop when:** No transitive consumer requests `axios < 1.18`. Verify with `yarn why axios`.

#### `node-fetch: ^2.6.7`

- **Why:** Without it, `node-fetch@1.7.3` enters the tree through a consumer that requests `^1.0.1`, and the advisory's fix is on 2.6.7, which that range cannot reach. It has to stay a range: `cross-fetch@^4.0.0` declares `node-fetch@^2.7.0`, and an exact `2.6.7` would hold it below its own range. It resolves to 2.7.0.
- **Fixes:** GHSA-r683-j2x4-v87g (high): secure headers forwarded to untrusted sites across a cross-host redirect.
- **Drop when:** the `^1.0.1` consumer is gone. Verify by removing the entry, re-installing and confirming no 1.x appears.

#### `lodash: ^4.18.0`

- **Why:** `lodash` is not a direct dependency. Without the pin it resolves _down_ to `4.17.21`, because `@eyeseetea/d2-api@1.21.0` and `@eyeseetea/d2-ui-components@2.12.0` both request that exact version. Every other consumer asks for a range satisfied by 4.18.x, and `yarn why` shows a single major line, so a global pin is safe.
- **Fixes:** GHSA-r5fr-rjxr-66jc (high): code injection via `_.template` import key names.
- **Drop when:** `@eyeseetea/d2-api` and `@eyeseetea/d2-ui-components` stop pinning lodash exactly.

#### `react-linkify/linkify-it: ^5.0.2`

- **Why:** `react-linkify@1.0.0-alpha` requests `linkify-it@^2.0.3`, and the 2.x line has no fix. `@eyeseetea/d2-ui-components` requests react-linkify at an exact version, and `2.13.0-beta.6` still does, so upgrading that library does not help. react-linkify is unmaintained and written against the linkify-it 2 API, so this pin was **checked rather than assumed**: linkify-it 5 still ships a callable CJS export, `.tlds()` and `.match()` behave the same, and rendering `<Linkify>` in jsdom produces the expected `<a href>`. Scoped to react-linkify so `markdown-it`'s own linkify-it is untouched.
- **Fixes:** GHSA-v245-v573-v5vm, GHSA-22p9-wv53-3rq4 (high): quadratic-complexity DoS.
- **Drop when:** `@eyeseetea/d2-ui-components` drops or replaces `react-linkify`.

#### `qs: ^6.15.3`

- **Why:** `@eyeseetea/d2-api` requests `qs` at exactly `6.9.7` and `request` requests `~6.5.2`; without the pin both resolve _downwards_ into the advisories below. It also binds `url` (through the browser polyfills). `@eyeseetea/d2-api` makes it **runtime**, so changes to it are verified with the test suite and a build, not only with `yarn install`. `request`'s only use here, `fetchAndExtract` in `@dhis2/cli-helpers-engine`, passes no `qs` option.
- **Fixes:** GHSA-6rw7-vpxm-498p and GHSA-q8mj-m7cp-5q26 (medium), GHSA-w7fw-mjwx-w883 (low).
- ⚠️ **The floor does not cover GHSA-4mjr-xmp4-gh2g or GHSA-x5fp-wj9c-mxmx** (both medium, fixed in 6.16.0). The range admits 6.16.0 and the lockfile resolves it, so the tree is clean, but a lockfile held at 6.15.3 would not be.
- **Drop when:** every consumer requests `qs >= 6.16.0` natively. `@eyeseetea/d2-api` is the blocker.

#### `@dhis2/cli-app-scripts/vite: ^6.4.3`

- **Why:** `@dhis2/cli-app-scripts` requests `vite@^5.2.9`, and the 5.x line has no fix for the three vite advisories below; its `esbuild@0.21.5` is also in range of GHSA-67mh-4wv8-2f99. 6.4.3 is the lowest release that clears all three, and it requests `esbuild@^0.25.0`. The i18n commands this repository runs do not load vite; only the package's `build` and `start` commands do, through `import('vite')`, and this repository does not use them. Checked that those command modules still load and that the import resolves to 6.4.3.
- **Fixes:** GHSA-fx2h-pf6j-xcff (high), GHSA-v6wh-96g9-6wx3 and GHSA-4w7w-66w2-5vf9 (medium) against vite; GHSA-67mh-4wv8-2f99 (medium) against `esbuild@0.21.5`.
- ⚠️ Dependency-Track may report `esbuild@0.25.12` against GHSA-gv7w-rqvm-qjhr. That advisory was withdrawn: dismiss the alert, do not remediate it.
- **Drop when:** `@dhis2/cli-app-scripts` requests `vite >= 6.4.3` natively.

#### `@dhis2/cli-helpers-engine/tar: ^7.5.21`

- **Why:** `@dhis2/cli-helpers-engine@3.2.2`, its latest release, requests `tar@^4.4.8`, which resolves to 4.4.19. Every advisory below is fixed only on the 7.x line, the last of them at 7.5.21. Its single use is `tar.extract({ strip: 1, cwd })` in `lib/cache/fetchAndExtract.js`, and that function was exercised end to end: `request` downloads a `.tar.gz` from a local server and tar 7 extracts it.
- **Fixes:** GHSA-23hp-3jrh-7fpw (critical); GHSA-34x7-hfp2-rc4v, GHSA-83g3-92jg-28cx, GHSA-8qq5-rm4j-mr97, GHSA-8x88-c5mf-7j5w, GHSA-9ppj-qmqm-q256, GHSA-qffp-2rhf-9h96, GHSA-r292-9mhp-454m, GHSA-r6q2-hw4h-h46w (high); GHSA-f5x3-32g6-xq36, GHSA-gvwx-54wh-qm9j, GHSA-vmf3-w455-68vh, GHSA-w8wr-v893-vjvp (medium).
- **Drop when:** `@dhis2/cli-helpers-engine` requests `tar >= 7.5.21` natively.

#### `execa@npm:0.7.0/cross-spawn: ^6.0.6`

- **Why:** `@dhis2/cli-helpers-engine` → `update-notifier@3.0.1` → `boxen@3.2.0` → `term-size@1.2.0` requests `execa@^0.7.0`, which requests `cross-spawn@^5.0.1`. GHSA-3xgq-45jj-v275 is patched at 6.0.6 and 7.0.5 and not on 5.x. The versioned-parent form is required: `execa@5.1.1` is also in the tree and declares `^7.0.3`, so `execa/cross-spawn` would drag it below its own range. `execa@0.7.0` calls `cross-spawn`'s internal `_parse` and `_enoent.hookChildProcess`, both still present in 6.0.6; exercised through `execa.sync`, `execa.shellSync`, the `ENOENT` hook, the async API, and `term-size` itself.
- ⚠️ **Decay risk: keyed on the resolved version.** 0.7.0 is the only 0.7.x release published, so the key cannot go stale through a patch bump, but check it at every audit.
- **Fixes:** GHSA-3xgq-45jj-v275 (high): ReDoS in argument escaping.
- **Drop when:** `term-size@1.x` leaves the tree, which happens when `@dhis2/cli-helpers-engine` moves off `update-notifier@3`.

#### `external-editor/tmp: ^0.2.7`

- **Why:** `@dhis2/cli-helpers-engine` → `inquirer@7.3.3` → `external-editor@3.1.0` requests `tmp@^0.0.33`. The floor is 0.2.7 rather than 0.2.6 because GHSA-7c78-jf6q-g5cm affects exactly `>= 0.2.6, < 0.2.7`. `external-editor` calls `tmp.tmpNameSync()`; exercised by creating and cleaning up an editor temp file.
- **Fixes:** GHSA-ph9p-34f9-6g65 and GHSA-7c78-jf6q-g5cm (high); GHSA-52f5-9888-hmc6 (low).
- **Drop when:** `external-editor` requests `tmp >= 0.2.7` natively, or leaves the tree.

#### `http-proxy-agent/@tootallnate/once: ^2.0.1`

- **Why:** `@dhis2/cli-app-scripts` → `@jest/core@27` → `jsdom@16.7.0` → `http-proxy-agent@4.0.1` requests `@tootallnate/once@1`. The fix is 2.0.1. `http-proxy-agent` only calls it as `once(socket, 'connect')`; exercised with a request through a local proxy.
- **Fixes:** GHSA-vpq2-c234-7xj6 (low).
- **Drop when:** `http-proxy-agent@4` leaves the tree.

#### `latest-version/package-json: ^7.0.0`

- **Why:** `@dhis2/cli-helpers-engine` → `update-notifier@3.0.1` → `latest-version@5.1.0` requests `package-json@^6.3.0`, which requests `got@^9.6.0`, and GHSA-pfrx-2q88-qq97 is fixed in got 11.8.5. `package-json@7.0.0` is still CommonJS and declares `got@^11.8.2` itself, so got 11 arrives through a parent written for it. Exercised by calling `latestVersion()` against a local registry, which is how `update-notifier` uses it. The direct alternative, `package-json/got: ^11.8.5`, breaks the consumer; see "Rejected pins".
- **Fixes:** GHSA-pfrx-2q88-qq97 (medium).
- **Drop when:** `latest-version` requests `package-json >= 7` natively, or `update-notifier@3` leaves the tree.

#### `request/form-data: ^2.5.6` and `request/tough-cookie: ^4.1.3`

- **Why:** `@dhis2/cli-helpers-engine` → `request@2.88.2` requests `form-data@~2.3.2` and `tough-cookie@~2.5.0`. `request` has no later release (see "Known findings"), so its children are lifted directly. Exercised with a multipart upload and a cookie jar carried across two requests against a local server.
- **Fixes:** `form-data`: GHSA-fjxv-7rqg-78g4 (critical), GHSA-hmw2-7cc7-3qxx (high). `tough-cookie`: GHSA-72xf-g2v4-qvf3 (medium).
- **Drop when:** `request` leaves the tree.

#### `i18next-conv/node-gettext: ^3.0.1`

- **Why:** `@dhis2/cli-app-scripts` → `i18next-conv@9.2.1` requests `node-gettext@^2.0.0`, which resolves to the vulnerable `2.1.0`. ⚠️ **The advisory looks unfixable and is not.** GHSA-g974-hxvm-x689 declares no `first_patched_version`, so tooling reports it as having no fix, but its affected range is `<= 3.0.0` and **3.0.1 is published and outside that range**. Always compare the affected range against the published version list before concluding a finding is a dead end. Build-only, used during `yarn localize`.
- **Fixes:** GHSA-g974-hxvm-x689 (high): prototype pollution.
- **Drop when:** `i18next-conv` requests `node-gettext@^3.0.1` or later natively, or drops it. Verify with `yarn why node-gettext`.

#### `styled-jsx/loader-utils: ^1.4.2`

- **Why:** `@dhis2/cli-app-scripts` → `@dhis2/app-shell` → `styled-jsx@4.0.1` requests `loader-utils` at exactly `1.2.3`. The application's own `styled-jsx@5.1.7` does not depend on `loader-utils`, so the parent-name path binds only the 4.0.1 copy, and `loader-utils@2.0.4` elsewhere is untouched. Exercised by running the styled-jsx webpack loader, which reads its options through `loaderUtils.getOptions`.
- **Fixes:** GHSA-76p3-8jx3-jpfq (critical); GHSA-3rfm-jhwj-7488 and GHSA-hhq3-ff78-jv3g (high).
- **Drop when:** `styled-jsx@4` leaves the tree.

---

## Rejected pins

Tried, verified to break a consumer, and reverted. Recorded so nobody re-tries them.

| Pin attempted                      | What broke                                                                                                                                                                                                                                    |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `brace-expansion: ^5.0.9` (global) | `minimatch@3.x` dies with `TypeError: expand is not a function`: v5 switched from a default export to a named one. Do not force one brace-expansion line across the tree; each minimatch major has its own, and all three are patched today. |
| `request/uuid: ^11.1.1`            | `ERR_PACKAGE_PATH_NOT_EXPORTED`: `request` does `require('uuid/v4')`, and the `./v4` subpath was removed in uuid v7. No uuid version both fixes the advisory (11.1.1+) and keeps that subpath.                                               |
| `package-json/got: ^11.8.5`        | `package-json@6.5.0` loads, then every lookup fails with `RequestError: The GET method cannot be used with a body`: it passes `json: true`, which got 9 reads as "parse the response" and got 11 as "send a JSON body". Use `latest-version/package-json: ^7.0.0` instead. |

---

## Known findings with no fix available

Recorded here rather than in `resolutions` because **no version resolves them**.

#### `elliptic@6.6.1`: GHSA-848j-6mx2-7j84

- **Chain:** `vite-plugin-node-polyfills` → `node-stdlib-browser` → `crypto-browserify` → `browserify-sign` and `create-ecdh`.
- **Why it cannot be fixed:** the advisory covers **all versions `<= 6.6.1`**, and 6.6.1 is the latest published release. There is nothing to pin to; verified against the published version list. No other advisory against `elliptic` is open at this version.
- **Impact:** the ECDSA signing path is never reached. The polyfills exist only because `md5.js` needs the `Buffer` shim.
- **Drop when:** `elliptic` publishes a fix, or `md5.js` is replaced and the polyfill chain leaves the tree entirely.

#### `request@2.88.2`: GHSA-p8p7-x288-28g6

- **Chain:** `@dhis2/cli-app-scripts` → `@dhis2/cli-helpers-engine@3.2.2` → `request@^2.88.0`.
- **Why it cannot be fixed:** the advisory affects `<= 2.88.2` and records no patched version. 2.88.2 is the last release `request` ever published, and the package is deprecated, so there is nothing above the affected range to move to. The scoped resolutions on its children (`form-data`, `tough-cookie`) address those packages, not this one.
- **Impact:** build tooling only. Its single use here is `fetchAndExtract` in `@dhis2/cli-helpers-engine`, and it never reaches the browser bundle.
- **Drop when:** `@dhis2/cli-helpers-engine` drops `request`.

#### `uuid@3.4.0`: GHSA-w5hq-g745-h8pq

- **Chain:** `request@2.88.2` → `uuid@^3.3.2`.
- **Not reachable in this tree.** The advisory is a missing bounds check in `v3()`, `v5()` and `v6()` when the caller supplies an output buffer. `request` imports only the `v4` subpath (`lib/auth.js`, `lib/multipart.js` and `lib/oauth.js` each do `require('uuid/v4')`), and all three call sites invoke it with no arguments.
- **Why it cannot be fixed:** the advisory is patched at 11.1.1, but `request` imports `uuid/v4`, and that subpath was removed in uuid v7. Forcing the patched version fails at load; see "Rejected pins".
- **Impact:** build tooling only. Dependency-Track scores it high; the GitHub advisory database rates it medium.
- **Drop when:** `request` leaves the tree.

---

## Decay-monitoring checklist

When auditing, treat any of these as a signal that a pin has gone stale:

- A finding of **any severity** reappears for a package that has an active resolution. Do not filter this check to critical/high: medium findings on a pinned package are exactly the ones that sit unnoticed below the gate's threshold.
- `yarn why <pkg>` shows the resolved version _not matching_ the right-hand side of the resolution.
- **A pin that holds a consumer below its declared range.** Compare the resolution against what the parents actually request: `grep -E '^\s+<pkg>: "npm:' yarn.lock | sort | uniq -c`. If a parent declares `^3.3.16` and the pin forces `3.3.8`, the pin is not protecting anything: it is overriding a package's own compatibility statement, and it cannot receive patches either.
- **A floor below the highest patched version of its own advisories.** A new advisory can land on the floor itself, as `tmp` shows. Re-read every advisory an entry lists when a new one appears for the same package.
- **A scanner alert whose prose contradicts the advisory's own data.** An advisory's description is written when it is published and is not rewritten when a backport lands, so it can say a line has no fix while the machine-readable ranges already record one. Read the ranges (`gh api advisories/<GHSA> --jq '.vulnerabilities[]'`) against the published version list, and treat the summary as a hint.
- **A pin whose removal changes nothing.** Delete it, reinstall, and compare **the resolved versions**, not the lockfile bytes. A pin can rewrite a descriptor, change the lockfile, and still leave every installed version where it was.

---

## Notes for applications copying this baseline

- **The vite 7 upgrade does not require ESLint 9.** `vite-plugin-checker@0.11.0` supports `vite >=5.4.20` while still accepting `eslint >=7`; only 0.12.0 raises the floor to `eslint >=9.39.1`. An application on ESLint 8 can take the vite, vitest and esbuild fixes without touching its linter.
- **vitest 3 → 4 needs `/// <reference types="vitest/config" />`** in the file that configures vitest. GHSA-82fw-gwwq-j7x9 has no fix on 3.x. In vitest 4 only `vitest/config` adds the `test` key to vite's config types. With the old reference the tests still run, but the `test` block either becomes a type error (a config object, as here) or silently stops being type-checked (a config returned from a function). Expect a `vite@8` entry in `yarn.lock` afterwards: vitest 4 declares `vite` as both a dependency and a peer, yarn records the newest 8.x for the dependency, and the peer wins, so nothing from it is installed.
- **Moving from `@dhis2/d2-i18n-extract` / `@dhis2/d2-i18n-generate` to `@dhis2/cli-app-scripts`.** The scripts become `d2-app-scripts i18n extract -p src/ -o i18n/` and `d2-app-scripts i18n generate -n <namespace> -p ./i18n/ -o ./src/locales/`, and the dependency chain needs the `@dhis2/cli-app-scripts`, `@dhis2/cli-helpers-engine`, `execa`, `external-editor`, `http-proxy-agent`, `latest-version`, `request`, `i18next-conv` and `styled-jsx` resolutions above.
    - **Keep `@dhis2/cli-app-scripts` at exactly `12.11.1`.** 12.11.3 and 12.11.4 add `__MANIFEST_APP_TITLE` and `__MANIFEST_APP_DESCRIPTION` to `en.pot` and to the generated translations whenever there is no `d2.config.js`. Those strings are for DHIS2 app platform manifests, and this project builds its manifest with `d2-manifest`. Unpin when a release stops adding them without a `d2.config.js`.
    - `en.pot` gets its `msgstr` filled with the source string instead of left empty. What the application displays does not change: `i18n.t()` returns the same text for every key in every locale.
