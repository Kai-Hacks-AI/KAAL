# Pull Promotion v1 capability: Testing (target)

Cases are runnable files `test/pull/T<n>.test.mjs` with shared fixtures in `test/pull/fixtures.mjs`, GREEN since the DO (they were `.red.mjs` beside this document in the PLAN). Run them with `npm test -w @kaihacksai/kaal-release`.

| Case | Requirement | What it shows |
| --- | --- | --- |
| pull/T19 | F21 | One entry per declared collector in the declared order; a missing collector is not judged; an undeclared host collector is reported; input order does not matter; an empty declaration is reported. |
| pull/T20 | F22 | PLAN, DO, ACT landed in the collector and green declared checks qualify; a missing or open phase, a phase landed elsewhere, a failed check do not, naming which; a missing or pending check, a piece without a Change and an unplaced delivery are not judged; what was already delivered is not evidence. |
| pull/T21 | F23 | Qualifiers in the declared order, the first as next, from the declaration alone; a failing collector is skipped; none qualifying gives a reason and each collector says why. |
| pull/T22 | F24 | No ready or authorization vocabulary, no action; no review, behind-target or Show WIP in the source; only a file reader imported; the command line prints the same result and names an unreadable file. |
| pull/T23 | F21, F22 | REAL evidence of 12 Nov 2026: `kaal/release/wire-fallback-template` does not qualify, naming the missing PLAN and ACT of release/C14, with its green checks not reported as missing. |
| pull/T24 | F22 | (added in the DO at the CPO's review) An open piece keeps its Change in the evidence and is never a landed phase; a Change with only open pieces cannot hide behind another complete Change; an open piece naming no Change is not judged. |
| pull/T25 | F22 | (added in the DO at the CPO's review) An absent or empty lifecycle or Check declaration is not a vacuous success: every collector is not judged, naming the missing declaration. |

The Cases of `pull/C1` (T1 to T13) that test the dropped judgments retire in the DO with the requirements they trace; those that remain true are kept or folded. The DO states which.

It does not prove: that the declaration is the right policy (the Release declaration is deferred), the host reading (that is `pull/C2`), or that a qualifier is safe to promote (authorization and the preventive controls own that).
