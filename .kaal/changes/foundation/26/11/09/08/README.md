# Foundation: tree DO stage 2, the build leaves delivery out and the engineering suite is collected (C21)

Capability: Foundation. Target: `kaal/foundation`. Record number provisional until integration. Stage 2 of the landed tree PLAN (#1294); stage 1 is #1302.

## What changes
- `04-test/engineering-check/build.mjs` copies no path that has a segment named `delivery` (foundation/F41, A26). Nothing is named `delivery` yet, so `dist/` is unchanged.
- New `04-test/engineering-check/collect.mjs` collects every `*.test.mjs` in `publisher/` and runs it. `test:publisher` is `npm run build && node 04-test/engineering-check/collect.mjs`; no file is named by hand (foundation/F42).
- T20 and T13 (publication) are updated to check the collector instead of an explicit file list. Their titles and targets are otherwise unchanged. A26's row for `04-test/engineering-check/` names the collector. `verify.json` regenerated.

## Verified
`npm run test:publisher` 40 of 40, `npm test` verified, T67 and T68 GREEN. T65, T66, T70 stay RED until their stages.

## Not authorized
No promotion, version bump on main, SYNC, ledger entry, release dispatch or npm publication.
