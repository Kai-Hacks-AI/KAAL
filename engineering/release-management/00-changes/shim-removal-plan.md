# Removal of the release shims (PLAN)

PLAN, nothing is removed by this Change. Follows the F20 rule: a moved module keeps its old interface until its last caller is rewired, then the shim goes, in its own Engineering Change, after the `.github` rewiring (#1327).

## Finding

`engineering/release/` holds two full-facade shims of the moved engine (#1324), `release.mjs` and `run.mjs`. The `current-state.md` entry says both have no caller left. Measured now with the parsers of T13, only `run.mjs` is callerless (the workflow `publish.yml` calls the engine at its new path). `release.mjs` still has four importers, all test files of other capabilities:

| Importer | Capability |
| --- | --- |
| `packages/kaal-hosting/04-test/engineering-check/publisher/dependency-successors.test.mjs` | Hosting |
| `packages/kaal-hosting/04-test/engineering-check/publisher/release-record.test.mjs` | Hosting |
| `packages/kaal-change/test/publisher/package-only.mjs` | Change |
| `packages/kaal-change/test/publisher/providers.test.mjs` | Change |

A Change touches one capability, so those four rewirings cannot ride with an Engineering Change.

## Sequence

1. **This PLAN**, CPO review, merge into the collector. A landed PLAN is a go.
2. **Engineering Change 1 (RED, DO): remove `run.mjs`.** The only callerless shim.
   - RED: T14 and T12 are changed to the state after removal (the old folder holds only `release.mjs`; T12 covers `release.mjs`), failing while `run.mjs` stands. T13 keeps judging the end of the migration (its shim list shrinks to what exists, so a called shim that is missing stays RED).
   - DO: delete `engineering/release/run.mjs`; correct the `current-state.md` entry (`release.mjs` is still called, by the four importers above; `run.mjs` is gone) and `transformation.md`; update the Change record.
3. **Hosting Change, Change (capability) Change:** each rewires its two importers to `engineering/release-management/05-src/release-engine/release.mjs`. One small Change per capability, each with its own record; no behavior change, the parity Cases of the engine are unchanged.
4. **Engineering Change 2: remove `release.mjs`** once T13 reports it callerless, and with it the empty `engineering/release/` folder, T12 and T14. F20 and `change-requirements.md` go with the terminate Change (step 8), because T13 must still be able to judge the end of the migration until then.

Steps 3 and 4 may reorder with the phase control; nothing between them depends on it.

## Not in this Change

`.github`, any change of the engine, F20's wording, promotion into `main`, the Change-suite phase control (taken after this removal, per the handover).

## Acceptance

| # | Criterion | Case |
| --- | --- | --- |
| 1 | After step 2, `engineering/release/` holds only `release.mjs` and it is a full facade | T14, T12 |
| 2 | A shim is never removed while a caller exists | T13 (RED when a called shim is missing) |
| 3 | After step 4, no shim and no caller remain, and T13 says the requirement is the only thing left | T13 |
| 4 | Nothing that imported the old path breaks | the engineering and the two capabilities' suites |
