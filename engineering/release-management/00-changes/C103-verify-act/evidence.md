# C103 evidence

Observed on Node 24, on `main` 1168212 plus this PLAN.

## Expected RED (the PLAN's tree)

Each of the seven Cases was run alone and fails for the reason the PLAN states:

| Case | Result |
| --- | --- |
| T1260, T1261, T1262 | the element file (`I56.md`, `F80.md`, `A71.md`) is absent |
| T1263 | `release/CTL24 is not listed` |
| T1264, T1265, T1266 | `judge-act.mjs is absent` |

`node --test engineering/cases/cases.test.mjs` on this tree: 300 tests, 284 pass, 16 fail. The same 16 fail on `main` at 1168212 (a clean checkout), so this PLAN adds none. The `.red.mjs` files are ignored by the finders and the runner.

## Each Case can pass (throwaway copy)

In a throwaway copy of the repository the five drafts of `interface.md` were written as the DO's files (the Intent, the Requirement, the Architecture, the control, `05-src/phase/judge-act.mjs`) and each Case run alone: T1260 to T1266 all pass. T1265 and T1266 build a real collector in a scratch Git repository (main, a PLAN adding two RED Cases, a SYNC merge from main, a DO that renames them to `.test.mjs` in an element folder and adds a third Case), so the planned Cases are read from real history and survive a SYNC and the DO. T1266 then makes each negative as a commit on a candidate branch (a deleted Case, a renamed-back Case, an edited Case) and runs the command line: exit 0 only for the DO that made exactly the planned Cases green, exit 1 with `finish your work first` and the Case named otherwise, exit 2 when nothing could be judged.

Three mutations of the judge were made in the copy (no guard for a PLAN without Cases, no fingerprint comparison, UNKNOWN treated as green); T1266 failed for each, so it is not satisfied by accident.

## Not observed here

Testing's observation (expected-failures ACT #2123) is not on `main`, so no Case reads a real Testing report: the observations are hand-made in the Cases, in the shape the judge takes. The adapter from the report to that shape, the workflow and the hook are later slices.
