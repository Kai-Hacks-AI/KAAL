# Fifth live run: every test file is a Case or declared otherwise

Runs one to four are kept unedited. Same invocation and host (Kai-Hacks-AI/KAAL, GET calls only), 13 Nov 2026 after 19:50 UTC, exit 0, stderr empty. Result: [live-report-complete-discovery.json](live-report-complete-discovery.json), unedited. **No collector qualifies.**

## What the completeness rule found

With pull/F33 (every `.test.mjs` file of a scope is a Case or declared not to be one), the declaration of the fourth run was found incomplete: the Cases kept in the `plan/<change>/` folders of `packages/kaal-release` and in the `01-intent`, `02-requirements` and `03-architecture` folders of the engineering work were not named by any Case pattern (27 test files of `verify-plan`, 15 of `kaal/release/plan`). The declaration now names those shapes, and the test suites that run Cases (`packages/*/test/*.test.mjs`) are declared not to be Cases. [collector-files.json](collector-files.json) records the delta and the test files of every collector, and Case pull/T14 checks that no delta file lies outside its collector's scope and no test file is unnamed.

## What the run shows

- **kaal/release/plan**: genuinely missing, five retrospectives instead of one; its `pull` Cases lack a scoped-id execution at the head (reader limit).
- **verify-plan**: genuinely missing, no concluding ACT, and its engineering Cases (T1 to T14 and more) now expected, with no execution at the head: CI on this repository does not run them.
- **change-isolation**: its engineering Cases T48 to T54 have no execution at the head, and its delta is empty.
- **wire-*** and **approve-change**: no PLAN or ACT of their own in the collector (the paired `-engineering` collector holds them, or none exists).
- **check-pr-envelope**: no longer listed by the host.

The declaration's completeness for PLAN, DO and ACT shapes is not enforced by the qualifier; it is reviewed with the declaration (pull/F33).
