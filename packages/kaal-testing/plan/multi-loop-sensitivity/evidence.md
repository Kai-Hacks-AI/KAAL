# Multi-Loop Testing and Sensitivity: Evidence

Baseline: `origin/main` at `af8f3968` on Windows (`Node v24.20.0`).

## RED of this PLAN

Run:

```sh
node packages/kaal-testing/test/plan/multi-loop-sensitivity/run-red.mjs
```

Observed output (`Summary: 4 RED-observed, 0 GREEN, 0 ERROR`, exit 0):

| Case | Checks | Observed on `origin/main` | Reason |
| --- | --- | --- | --- |
| `testing/T378` | `testing/F152` | RED | the Skill still carries `"The three loops"` instead of `"Testing loops"` |
| `testing/T379` | `testing/F153` | RED | the Skill has no section `"Testing loops"` |
| `testing/T380` | `testing/N34` | RED | the Skill has no section `"Testing loops"` |
| `testing/T381` | `testing/F154` | RED | baseline GREEN; inert stub killed by `ERR_ASSERTION`; 3 of 15 targeted mutants killed, 12 survived |

### Pilot Baseline Observation (`testing/T381` on `lib/contracts.mjs`)

Against current `packages/kaal-testing/test/contracts.test.mjs`:

- **Inert stub (`INERT_STUB`):** `killed` (`ERR_ASSERTION`) — confirms `test/contracts.test.mjs` achieves behavioural RED against a neutral stub.
- **Killed mutants (3 / 15):**
  1. `incomplete review missing pr/commit/hashes accepted`
  2. `crafted per-test status accepted`
  3. `parent traversal '..' in repoPath accepted`
- **Surviving mutants (12 / 15 — potential defects in `test/contracts.test.mjs` awaiting `testing/C71`):**
  1. `owner kind mismatch accepted`
  2. `owner name mismatch accepted`
  3. `malformed owner accepted (isRef skipped)`
  4. `non-array statements accepted`
  5. `empty quote accepted`
  6. `invalid statement sha256 accepted`
  7. `missing limits with offered evidence accepted`
  8. `invalid evidence sha256 accepted`
  9. `empty evidence test path accepted`
  10. `stale review statement hash treated as at-pins`
  11. `permuted review evidence hash order falsely marked stale`
  12. `missing source file treated as present`

## Reproduce

```sh
node packages/kaal-testing/test/plan/multi-loop-sensitivity/run-red.mjs
```
