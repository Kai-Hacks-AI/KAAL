# C103 change

## PLAN

1. Add the drafts in `interface.md` (the Intent, the Requirement, the Architecture, the control and the source `judge-act.mjs`) and the Cases T1260 to T1266, all RED.
2. Observe the expected RED and that each Case can pass with the drafts as the DO's files (`evidence.md`).
3. The PLAN adds no source file, no workflow, no hook, no ruleset and no setting outside the drafts.

## Mechanism

- release/I56 is the contract: an ACT enters a collector only when the Cases that apply to its Change are really green.
- **The collector is an artifact-driven workspace, measured from its content.** It may receive any number of PLANs while work is underway. Each adds or amends Cases together with the KAAL artifacts and relationships that justify them (Intent, Requirement, Architecture, Defect), and so changes which Cases are applicable and how many are RED. Any number of DOs then implement the work and turn those Cases GREEN; exactly one ACT follows. Pull requests and commits transport the work and give it provenance. Their titles, first-parent history and merge shapes are not read: the judge takes a folder, never Git.
- **What applies** (`applicableCases`): the Intents that the Change record (`C<n>.md`) implements, widened along the one-way relationships (`serves`, `addresses`, `has`, read from the elements, placed or still drafted in the Change folder) to every element that reaches one; then every Case that is in the Change folder or `tests` one of those elements, wherever it stands. A Case parked as `T<n>.red.mjs` is RED by construction; a Case is not really green while any file carrying its id is parked. A relationship amended away drops the Cases it alone justified; a retired Case is simply absent.
- **Verdicts.** FAIL when an applicable Case is parked red or observed RED; the message is `finish your work first: <Cases> of N applicable Cases are not really green`, with the count of red, green and unknown. UNKNOWN when none of that holds but a Case was not observed green, or no Case applies: UNKNOWN never passes. PASS only when every applicable Case is not parked and observed GREEN. PASS is not an approval and not a merge decision.
- **Observations come from Testing.** The judge takes `{ '<scope>/T123': 'GREEN' | 'RED' | 'UNKNOWN' }`; the exit code of a test run is never a verdict. Which folder to measure, which Change, and the adapter from Testing's report are the wiring's; the check can run locally or in CI against the checked-out branch.
- **Two concerns, kept apart.** Content measurement (this Change) says whether the work is finished. Transport authorization (whether a given PR may add, change or retire a Case or an artifact: a DO that weakens a Case, the phase from the envelope, the ratchet of kaal-change change/F56) is a different control, aligned with kaal-change's contracts, in its own Change. verify Act does not guess it from history.
- The Cases build collectors as plain folders and make the work arrive by hand: PLAN 1 (a Change, a Requirement draft, two RED Cases), PLAN 2 (an Architecture draft and a Case beside it that is applicable only through the relationships; unrelated Cases stay out), a DO unparking Cases, PLAN 3 (retire one Case, add one, place an element so that it wins over its draft), a copy of a Case left parked, PLAN 4 (a relationship amended away drops its Cases), DOs finishing. The command line is run on them, and in a Git repository whose commit titles lie (PLAN, DO, ACT) with identical answers.

## Installation, timing and risks

- **Nothing is installed here.** The workflow, the hook mirror and a gate in the collecting ruleset are later slices; the workflow and the hook reach `.github` and `.githooks` by WIRE, the ruleset by the Owner, by hand.
- **Dependencies, named:** Testing's observation (expected-failures ACT #2123, not yet on `main`) and the hand-over of observations from the CI lanes, which is engineering's Change. Until the lanes hand observations over, the `.red.mjs` exclusion stays.
- **A Case file is read by two regular expressions** (`export const id`, `export const tests`), the shape every Case here has; a Case that does not state them is not found, so it is not required, and the Case runner of engineering still refuses unnamed Cases.
- **A collector's relationships are read from frontmatter** (`implements`, `serves`, `addresses`, `has`). A new relationship kind in KAAL's contracts has to be added to the list; the widening to Defects follows when their relationship is the same one-way kind.
