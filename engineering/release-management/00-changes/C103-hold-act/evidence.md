# C103 evidence

Observed on Node 24, on `main` 1168212 plus this PLAN.

## Expected RED (the PLAN's tree)

Each of the eight Cases was run alone and fails for the reason the PLAN states:

| Case | Result |
| --- | --- |
| T1260, T1261, T1262 | the element file (`I56.md`, `F80.md`, `A71.md`) is absent |
| T1263 | `release/CTL24 is not listed` |
| T1264, T1265, T1266, T1299 | `judge-act.mjs is absent` |

`node --test engineering/cases/cases.test.mjs` on the collector without this PLAN: 300 tests, 284 pass, 16 fail; with it applied as the DO's files: 308 tests, 292 pass, 16 fail, the same 16. This PLAN adds none. The `.red.mjs` files are ignored by the finders and the runner.

## Each Case can pass (throwaway copy)

In a throwaway copy of the repository the five drafts of `interface.md` were written as the DO's files (the Intent, the Requirement, the Architecture, the control, `05-src/phase/judge-act.mjs`) and each Case run alone: T1260 to T1266 and T1299 all pass.

T1265 and T1266 build collectors as plain folders and make the work arrive by hand, with no Git: PLAN 1 (the Change, a Requirement draft serving its Intent, two RED Cases), PLAN 2 (an Architecture draft, and a Case elsewhere applicable only through the relationships, while an unrelated Intent's Cases stay out), a DO unparking Cases wherever they stand, PLAN 3 (one Case retired, one added, an element placed over its draft), a copy of a Case left parked, PLAN 4 (a relationship amended away drops the Cases it alone justified) and the finishing DOs. The command line exits 1 with `finish your work first` and the counts while PLANs are not yet done, 0 only when every applicable Case is unparked and observed GREEN, 1 for an observed RED (FAIL outranks UNKNOWN), and 2, never passing, for an unobserved Case, a missing or unreadable observation, a Change that does not exist and a Change with no applicable Case. The same folder placed in a Git repository whose commit titles lie (PLAN: nothing is applicable, DO: finished everything, ACT: everything is green) gives identical answers.

Revised on 20 Nov 2026 after the CPO asked for the detective-first rollout (the control is `detective`, the rollout is written in change.md) and after the Owner named the ACT's controls: the control is `hold Act` and an ACT beside the Change folder is what it holds (T1299, new); T1264 and T1266 take that fact too. Mutations of the judge made in the copy each make at least one of T1264 to T1266 and T1299 fail: an absent the ACT not passing, an unknown one passing, a Change folder that is not there passing, no widening along the relationships, ignoring the drafts, the last file of an id winning over a parked one, ignoring the Change folder, a draft winning over its placed element, ignoring an observed RED, ignoring a parked Case.

## Not observed here

Testing's observation (expected-failures ACT #2123) is not on `main`, so no Case reads a real Testing report: the observations are hand-made in the Cases, in the shape the judge takes. The adapter from the report to that shape, the workflow and the hook are later slices.
