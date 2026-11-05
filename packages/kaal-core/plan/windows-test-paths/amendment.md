# Bounded amendment PLAN: two Core tests build host paths with `fileURLToPath` (core/D1, core/D2)

Review material only (`amendment.md` and `amendment.patch`). No live test, runtime or package byte changes. Same shape as the core/T40 amendment (#973).

## Why
core/D1 and core/D2 (#1013) are Core defects found by a Windows run of Core's full suite: two existing, immutable tests build a host path from a file URL's `pathname`, which is `/D:/a/...` on Windows. The RED Cases core/T121 and core/T122 (#1013) fail on every host until the two lines change. Fixing a defect in a test means amending an existing test, so this PLAN asks for the amendment before any is made.

## Amendment (the whole patch, `amendment.patch`)
- `test/core.test.ts`, the test 'keeps the id, name and type of every Node in this repository, and only the genesis has no type': `dirname(new URL(import.meta.url).pathname)` becomes `dirname(fileURLToPath(import.meta.url))`, with one added import from `node:url`.
- `test/plan/love.test.mjs`, helper `files()` used by core/T42: `new URL(PACKAGE).pathname.length` becomes `fileURLToPath(PACKAGE).length`, with one added import from `node:url`.

Nothing else changes: no assertion, title, fixture or expected value is touched, and no test is skipped or weakened. The Hosting boundary test governs Core's shipped JavaScript, not its tests, and `node:url` is already used by Core's tests and source.

## Evidence (Linux)
With the patch applied locally: `dist-test/core.test.js` 65 pass, 0 fail; `test/plan/love.test.mjs` 4 pass, 0 fail. The patch applies cleanly to `kaal/core` at the base of this PR. The Windows result is for CI to show: this PLAN does not claim it.

## Known limit
core/T40 and the core.test 'every Node' test also carry other path assumptions that Windows may expose once these two lines pass (for example `p.includes("/skills/")` on a backslash path). This amendment fixes only what core/D1 and core/D2 record. Anything further found is a new Defect with its own RED Case, not part of this amendment.

## Order
1. This PLAN, approved. 2. The Change applies `amendment.patch` as live tests; core/T121 and core/T122 pass unmodified and core/T123 still passes, which answers core/D1 and core/D2. 3. The one-off Windows run is repeated at the fixed head and its result recorded. Core 0.0.1 scope is unchanged. Nothing is promoted or published.
