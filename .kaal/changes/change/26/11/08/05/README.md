# The lane no longer discovers kaal-change's argument-required probe

Capability: Change. Integration scope: Change only.
Collector: kaal/change. Destination: main through a separate promotion.
Base: kaal/change after #1249.

## Request

Defect 2 of #1249 (Codex finding on #938): `engineering/lanes/suites.mjs` runs every
uncovered `test:*` script with no arguments and discovered `test:package-only`, which
needs a packed manifest and a fresh consumer directory.

## Change

- `package.json`: the `test:package-only` script is removed. The probe stays at
  `test/publisher/package-only.mjs` and is run by path.
- `docs/testing.md`: the usage line runs the probe by path.
- The report-only Case moves from `test/plan/defect-lane-discovery.test.mjs` to the
  gating `test/publisher/lane-discovery.test.mjs`; it is GREEN now.
- `test/verify.json` regenerated (package.json and docs digests).

## Verification

`test:publisher` 7 pass; `npm test` verified; manifest current; root `test:engineering` green.

## Boundary

No promotion, publication or version bump.
