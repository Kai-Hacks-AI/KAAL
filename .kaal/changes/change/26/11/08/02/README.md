# Change moves to the flat layout: packages/kaal-change carries the collector

Capability: Change. Integration scope: Change only.
Collector: kaal/change. Destination: main through a separate promotion.
Base: 2b56adc, kaal/change after SYNC step 2 (#1243, main at 2334cf9).

## Request

Main moved every package to `packages/<name>/` (#964). After the two-step SYNC
(#1237, #1239, #1243) kaal/change holds both main's older `packages/kaal-change`
(the workspace) and the collector's superset under `packages/skills/kaal-change`,
which no lane runs. Codex raised this on #1237 (P1): the collector's delivery,
lifecycle and record modules and its `test:collector` suite are not in the active
workspace. This Change puts the collector in the workspace and retires the old path.

## Change

- The collector's package replaces `packages/kaal-change`: 38 files main does not
  have, and the six files #938 prepared (README, Change-Definition, Change.md,
  ownership, package.json, verify.json), which differ from main's older copies.
  `packages/skills/kaal-change` is removed. The 38 files and every unchanged file
  arrive as renames.
- Path strings only, as the flattening hotfix did: `directory` in package.json,
  `paths` in `ownership.kaal.json`, the pinned path in `product.test.mjs` and
  `change.test.mjs`, `plan/isolation/README.md`'s statement about main, and the
  relative-import depth into `engineering/` in `package-only.mjs` and
  `providers.test.mjs`. `test/plan/release.test.mjs` finds Hosting at
  `../kaal-hosting` instead of `../../extensions/kaal-hosting`; that is a path
  clause only. PLAN documents keep their historical path text.
- `test/verify.json`'s `package.json` digest follows the new bytes. The capability
  id in `ownership.kaal.json` is the collector's own, which matches its Change.md.
- No root `package.json` or lock change: `packages/kaal-change` is already a
  workspace and the dependency set is unchanged.

## Verification

Run from a clean `npm ci` of this tree:

- `npm run test:collector`: 94 pass, 0 fail (the suite Codex said no lane ran).
- `npm test` (embedded verification): verified, all nine Cases pass.
- `npm run test:publisher`: 6 pass.
- `npm run manifest`: `test/verify.json is current`.
- Root `npm run test:engineering`: 277 pass, 0 fail.

The `test:collector` lane is discovered through `engineering/lanes/suites.mjs`
because `packages/kaal-change` is a workspace.

## Boundary

No promotion, publication or version bump. The Foundation 0.0.2 pin, the Graph
optional-peer correction and the two Defect fixes are separate Changes.
