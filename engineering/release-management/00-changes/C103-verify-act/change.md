# C103 change

## PLAN

1. Add the drafts in `interface.md` (the Intent, the Requirement, the Architecture, the control and the source `judge-act.mjs`) and the Cases T1260 to T1266, all RED.
2. Observe the expected RED and that each Case can pass with the drafts as the DO's files (`evidence.md`).
3. The PLAN adds no source file, no workflow, no hook, no ruleset and no setting outside the drafts.

## Mechanism

- release/I56 is the contract: an ACT enters a collector only when the Cases its PLAN added are really green.
- **The approved PLAN** is the cumulative result of the merged PLAN pull requests of the Change, folded in order. A PLAN pull request is a first-parent commit of the base that touches the Change folder and whose subject starts with PLAN (the title of the pull request, whose shape the envelope check already holds). A PLAN **adds** a Case (a Case file in the Change folder), **changes** one (a Case file of a Case already in force, wherever the DO moved it) or **retires** one (it deletes the Case and no other file of that id remains); the content fingerprint it gave is the one in force. A DO commit never changes what is in force. Everything is read from the base through Git, never from the candidate, so the candidate cannot choose what it is judged against, and a candidate commit titled PLAN changes nothing.
- **Real green, per Case in force:** at the head a file `T<n>.test.mjs` carries the same id (wherever the DO moved it) and no `.red.mjs` does, its content equals the one in force, and Testing's observation of it at the head is GREEN. A Case the DO changed, deleted or retired without an approved PLAN amendment is not that Case.
- **Verdicts.** FAIL when a Case in force is absent, still a `.red.mjs`, changed without an approved PLAN amendment or observed RED; the message is `finish your work first: T1, T2 of the PLAN are not really green`. UNKNOWN when none of that holds but a Case was not observed green, or no approved PLAN leaves a Case in force: UNKNOWN never passes. PASS only when every planned Case is really green. PASS is not an approval and not a merge decision.
- **Observations come from Testing.** The judge takes `{ T123: 'GREEN' | 'RED' | 'UNKNOWN' }`; the exit code of a test run is never a verdict. The adapter from Testing's report to this shape, and the workflow that runs the check on ACT pull requests into a collector, are later slices.
- The Cases derive their inputs from real Git history made in the Case (a collector with a PLAN, a DO and a SYNC) and make their negatives by hand: a deleted Case, a renamed-back Case, an edited Case, a Case reverted to a superseded PLAN version, a Case retired by a DO, a candidate commit titled PLAN, a Case observed RED, an unobserved Case, a PLAN without Cases.

## Installation, timing and risks

- **Nothing is installed here.** The workflow, the hook mirror and a gate in the collecting ruleset are later slices; the workflow and the hook reach `.github` and `.githooks` by WIRE, the ruleset by the Owner, by hand.
- **Dependencies, named:** Testing's observation (expected-failures ACT #2123, not yet on `main`) and the hand-over of observations from the CI lanes, which is engineering's Change. Until the lanes hand observations over, the `.red.mjs` exclusion stays.
- **The PLAN pull requests are found by the Git history of the collector.** A SYNC merge brings commits through its second parent, which a first-parent log ignores; a rewritten collector would change what is in force, which is why a collector is never rewritten. The subject convention (PLAN) is held by the envelope check; if a PLAN pull request were merged under another title, its Cases would not count and the check would say so by failing, never by passing.
- **A DO that must amend a Case** fails the check by design and returns to PLAN: the amendment is a new PLAN pull request, reviewed and approved like the first, and the cumulative PLAN follows it.
