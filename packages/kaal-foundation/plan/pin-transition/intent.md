# Foundation 0.0.2 repository pin transition

foundation/C17 PLAN (Foundation's part only). Step 3 of the 0.0.2 path (C15 PLAN, C16 DO #838).

- **foundation/I11**: When Foundation's workspace version moves to 0.0.2, every
  workspace consumer pins exactly that version and the root lock is generated to
  match, so a clean `npm ci` resolves one Foundation, the workspace copy, and no
  nested registry copy exists.

## Observed, 2026-11-02 (collector d1d3cbb)

Exact `"@kaihacksai/kaal-foundation": "0.0.1"` pins exist in:
`packages/kaal-core/package.json` (dependencies), `packages/skills/kaal-change/package.json`
(dependencies) and `packages/skills/kaal-testing/package.json` (devDependencies).
Root `package-lock.json` records the workspace `packages/kaal-foundation` at 0.0.1.
Assertions of the Core pin: `engineering/acceptance/embed.test.mjs` (dependency map
and no nested node_modules) and `packages/skills/kaal-change/test/publisher/providers.test.mjs`
(registry fixture). `engineering/release/release.test.mjs` uses 0.0.1 only as a
generic fixture and needs no change. `kaal-testing/plan/duplicates-dependency/*`
is historical evidence and stays.
