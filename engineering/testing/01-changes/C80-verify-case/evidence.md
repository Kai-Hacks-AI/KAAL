# C80 evidence

## Provenance

- **Baseline:** `origin/main` at `559d26ee` (branch `testing/c80-verify-case-plan`), observed on Windows (`win32`, Node `v24.20.0`).
- **Method:** Each planned Case's `run()` (`T397.red.mjs`–`T401.red.mjs`) was executed against the PLAN tree, then against a disposable scratch DO copy (`KAAL_TESTING_DIR`) holding the five drafted files placed into the `package-layout.json` layout. Layout conformance was checked via `judgeLayout` from `packages/kaal-engineering/skills/kaal-engineering/scripts/check-layout.mjs`.

## RED Result on This PLAN Tree

| Case | Tests | Observed Result on PLAN Tree |
| --- | --- | --- |
| `testing/T397` | `testing/I48` | `RED`: `I48.md is absent` |
| `testing/T398` | `testing/F173` | `RED`: `F173.md is absent` |
| `testing/T399` | `testing/A59`, `testing/F173` | `RED`: `A59.md is absent` |
| `testing/T400` | `testing/F173` | `RED`: `judge-verify-case.mjs is absent` |
| `testing/T401` | `testing/CTL1` | `RED`: `CTL1.md is absent` |

Summary: **5 RED-observed, 0 GREEN, 0 syntax/import errors.**

## Throwaway DO Verification (Can Each Case Pass?)

With the five drafts from `interface.md` placed at `10-intent/I48-cases-are-well-formed/I48.md`, `11-requirements/F173-verify-case/F173.md`, `12-architecture/A59-judge-verify-case/A59.md`, `13-source/scripts/judge-verify-case.mjs` (plus a `13-source/unit-tests/` file), and `14-operations/controls/CTL1-verify-case/CTL1.md` in a disposable scratch copy:

- `testing/T397`: **GREEN**
- `testing/T398`: **GREEN**
- `testing/T399`: **GREEN**
- `testing/T400`: **GREEN**
- `testing/T401`: **GREEN** (`find-controls.mjs` lists `testing/CTL1` with `refused: []`; `check-controls.mjs` reports `testing/CTL1 designed valid`)

## Layout Conformance (`judgeLayout`)

- **PLAN tree** (`01-changes/C80-verify-case/*`): `{"verdict":"PASS","findings":[]}`
- **Throwaway DO tree** (`01-changes/`, `10-intent/`, `11-requirements/`, `12-architecture/`, `13-source/`, `14-operations/`): `{"verdict":"PASS","findings":[]}`

## What This Shows and Does Not Show

- **Shows:** All five Cases fail behaviourally on missing DO deliverables in the PLAN tree, turn GREEN when the exact drafts are placed in the `package-layout.json` layout, and pass `find-controls.mjs`, `check-controls.mjs`, and `judgeLayout`.
- **Does not show:** That `verify Case` has run in CI or as a pre-push githook, that all repository Cases pass it yet, or that any `fixture:2`, `real:1`, or `provoked:1:fail` evidence records exist (`testing/CTL1` stays `detective` and `designed`).
