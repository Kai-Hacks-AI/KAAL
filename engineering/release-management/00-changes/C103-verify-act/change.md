# C103 change

## PLAN

1. Add the drafts in `interface.md` (the Intent, the Requirement, the Architecture, the control and the source `judge-act.mjs`) and the Cases T1260 to T1266, all RED.
2. Observe the expected RED and that each Case can pass with the drafts as the DO's files (`evidence.md`).
3. The PLAN adds no source file, no workflow, no hook, no ruleset and no setting outside the drafts.

## Mechanism

- release/I56 is the contract: an ACT enters a collector only when the Cases its PLAN added are really green.
- **The planned Cases** are the `T<n>.red.mjs` files of the Change folder at the oldest first-parent commit of the base that touches the folder, that is the merged PLAN. Each is kept with its content fingerprint. They are read from the base through Git, never from the candidate, so the candidate cannot choose what it is judged against.
- **Real green, per planned Case:** at the head a file `T<n>.test.mjs` carries the same id (wherever the DO moved it), its content equals the PLAN's (the same Case; a Case that has to change is a PLAN amendment), and Testing's observation of it at the head is GREEN.
- **Verdicts.** FAIL when a planned Case is absent, still a `.red.mjs`, changed since the PLAN or observed RED; the message is `finish your work first: T1, T2 of the PLAN are not really green`. UNKNOWN when none of that holds but a Case was not observed green, or the PLAN added no Case at all: UNKNOWN never passes. PASS only when every planned Case is really green. PASS is not an approval and not a merge decision.
- **Observations come from Testing.** The judge takes `{ T123: 'GREEN' | 'RED' | 'UNKNOWN' }`; the exit code of a test run is never a verdict. The adapter from Testing's report to this shape, and the workflow that runs the check on ACT pull requests into a collector, are later slices.
- The Cases derive their inputs from real Git history made in the Case (a collector with a PLAN, a DO and a SYNC) and make their negatives by hand: a deleted Case, a renamed-back Case, an edited Case, a Case observed RED, an unobserved Case, a PLAN without Cases.

## Installation, timing and risks

- **Nothing is installed here.** The workflow, the hook mirror and a gate in the collecting ruleset are later slices; the workflow and the hook reach `.github` and `.githooks` by WIRE, the ruleset by the Owner, by hand.
- **Dependencies, named:** Testing's observation (expected-failures ACT #2123, not yet on `main`) and the hand-over of observations from the CI lanes, which is engineering's Change. Until the lanes hand observations over, the `.red.mjs` exclusion stays.
- **The PLAN revision is found by Git history of the collector.** A SYNC merge brings commits through its second parent, which a first-parent log ignores; a rewritten collector would move the PLAN revision, which is why the collector is never rewritten.
- **A DO that must amend a planned Case** fails the check by design and returns to PLAN. Whether a recorded amendment may pass is an open question for the Owner, not decided here.
