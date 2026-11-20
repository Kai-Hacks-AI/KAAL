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

In a throwaway copy of the repository the five drafts of `interface.md` were written as the DO's files (the Intent, the Requirement, the Architecture, the control, `05-src/phase/judge-act.mjs`) and each Case run alone: T1260 to T1266 all pass.

T1265 and T1266 build a real collector in a scratch Git repository, as squash commits titled like pull requests: a PLAN adding three RED Cases, a SYNC merge from main, a first DO that turns one GREEN, a **PLAN amendment** that retires one Case, changes two (one still red, one already moved and green) and adds a fourth, then two more DO pull requests and a DO that weakens a Case. They show that: several PLAN pull requests contribute to one Change; an approved amendment adds, changes and retires Cases (the retired Case is not required, even observed RED); several DO pull requests implement the PLAN; a DO and a SYNC change nothing in force. The command line then exits 0 only when the DO pull requests made exactly the Cases in force green, and 1, naming the Case, for each unauthorized change: a deleted Case, a Case retired by a DO, a renamed-back Case, an edited Case, a Case reverted to a superseded PLAN version, a DO already merged in the collector that weakened a Case, a candidate commit titled PLAN, and an observed RED. It exits 2, never passing, for a missing, unknown or incomplete observation, an unresolvable head and a Change without a PLAN.

Mutations of the judge made in the copy each make T1265 or T1266 fail: dropping the PLAN-title filter (a DO would then change what is in force), ignoring the retirement by deletion, not following a Case that a DO moved, and not comparing fingerprints. Reading the history without `--first-parent` is not caught: the fixture's SYNC brings no commit that touches the Change folder.

## Not observed here

Testing's observation (expected-failures ACT #2123) is not on `main`, so no Case reads a real Testing report: the observations are hand-made in the Cases, in the shape the judge takes. The adapter from the report to that shape, the workflow and the hook are later slices.
