# C103 baseline

The baseline is `main` (1168212), with no commit of this Change.

- Nothing judges an ACT. An ACT into a collector merges when the CPO approves its head and the required checks of the collecting ruleset pass; no check asks whether the Cases the PLAN added are green.
- The Engineering Case runner (`engineering/cases/cases.test.mjs`) discovers `T<n>.test.mjs` Cases only. A planned Case is kept as `T<n>.red.mjs` until the DO renames it, so the runner ignores it; the CI Workspaces lane and the runner fail on any failing Case, so a Case cannot be shipped RED. The convention carries the RED state, not a policy.
- The Testing CLI reports observations (exit 0 means a report was produced, including RED and UNKNOWN; exit 2 means no report), and its expected-failures comparison is the open ACT #2123, not on `main`.
- The Dispatcher raises a PROMOTION when an ACT merges (release/C93, release/C73); it does not raise ACTs.
- The legacy checks around a PLAN (verify Plan, release/A1) are old drafts.
