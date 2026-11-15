# hosting/D5: the portability audit does not challenge a test that returns early on a platform after other statements

Owner: Hosting. Raised on 4 November 2026 from Codex's P2 finding on #1030 (`couplings.ts`, early-return classification), and put to Hosting as a potential detection Defect by the CPO/Owner ("finding 3c") with the direction to establish it with a minimal independent RED Case, then correct it in a separate Hosting-owned Change before Hosting 0.0.1 promotion. This record changes no source, test, script or package.

## Record

```json
{
  "id": "hosting/D5",
  "context": "hosting (couplings, portability audit)",
  "expected": "A test that returns early on a platform, after any number of other statements and before its assertions, is a registration finding, and portability() challenges the case (hosting/F29, hosting/F40).",
  "observed": "With `if (process.platform === \"win32\") { cleanup(); return; }` both platform findings are kind setup and portability().challenged is empty. With the return as the branch's first statement the case is challenged.",
  "where": "packages/kaal-hosting/src/couplings.ts, the classification of a test-scope finding as registration (an early return) or setup",
  "status": "confirmed",
  "tests": ["hosting/T101"]
}
```

## Contract

- hosting/F29: `registration` covers, in test scope, a platform finding that decides whether a test is registered or run, "and an early `return` from a test". Nothing there limits the return to being the first statement of the branch.
- hosting/F40: `portability().challenged` names the cases Testing must not count as evidence; it is built from `registration` and `dilution` findings.

## Observed and cause

Reproduced on the `kaal/hosting` 35df842 build (Node 22 sandbox; Codex reproduced on Node 24). The classification tests `/^\s*\{?\s*return\b/` against the branch body (`src/couplings.ts`, around line 171), i.e. only a `return` as the first statement, so `cleanup(); return;` falls through to `setup`, which `challenged` ignores. A case that executes no assertion on Windows therefore stays eligible as evidence there. The audit's own claim (hosting/F32) is that no finding means none was found within coverage; here a finding exists but is mis-kinded.

## Case

| Identity | Role | File |
| --- | --- | --- |
| hosting/T101 | the RED Case: a return after other statements in the platform branch challenges the case | [early-return.red.mjs](early-return.red.mjs) |
| hosting/T102 | control, passes today: the return is the branch's first statement and the case is challenged | same file |
| hosting/T103 | control, passes today: a return inside a function declared in the branch is not an early return | same file |

**Case version:** the Git blob id of `early-return.red.mjs`, `09d1fffd965799ac0ddbd0fe1a27b418ef685f1d`. Run by hand from the repository root after `npm run build -w @kaihacksai/kaal-hosting`: `node --test packages/kaal-hosting/defects/early-return.red.mjs`. **Confirming Run (4 Nov, Node 22 sandbox):** hosting/T102 and hosting/T103 pass, hosting/T101 fails (`challenged` is `[]`, expected `["c1"]`).

**Answered** only by a later Run in which hosting/T101 passes, at this Case version, in the Change that fixes `couplings.ts`, with hosting/T102 and hosting/T103 still passing.

## Bounds and correction

Nothing is fixed here. The correction is a separate Hosting-owned Change into `kaal/hosting`: detect a return within the controlling branch, excluding returns that belong to nested functions (hosting/T103 guards that), so the finding is `registration`. It changes `couplings.ts`, a committed path of the Hosting 0.0.1 increment, so the exact-path ledger entry and the promotion evidence are refreshed through the governed route before #1030; the fix is not smuggled into the existing commitment.

Related, separate: finding 3a (destructured platform queries are missed) and 3b (a quoted platform reference; classified by the CPO as a legitimate broad boundary challenge, no correction) are not covered by this record.
