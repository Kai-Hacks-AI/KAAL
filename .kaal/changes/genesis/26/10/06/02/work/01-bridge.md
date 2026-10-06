# Compatibility bridge for the containment test

## Intent

Let the containment test's fixture build its Changes through the process a Change-process evaluator has, whichever that evaluator is, so that a later change to the process does not turn the test red on a fixture it never meant to exercise. This is a support-engine change: it touches the test beneath the admission gate and nothing else.

## Requirements

R1. The fixture takes each Change it builds through the process as the evaluator under test defines it: where the evaluator reports the identity of `work/` (`work: <identity>`), a review round that converged on exactly that identity is written before the Work is sealed; where it does not, nothing is added.

R2. The fixture writes one retrospective more than the present process requires, `retro-review.md`, beside the two it has. An evaluator that takes two retrospectives ignores the surplus; one that takes three needs it.

R3. Every case of the test keeps its name and its expectation. No case is added, removed, relaxed or skipped.

R4. Nothing outside the test file changes, and the present process is used to close this Change.

## Architecture

The fixture's `change` function already walks work, seal work, retro-work, retro-observe, close. Two additions only: before sealing, read the identity line from the state command and, if present, write one review round naming it; and write `retro-review.md` with the other retros. The state command is the evaluator's own report, so the fixture needs no knowledge of how identities are made, and the same file serves the evaluator in the lineage and the one it is being bridged to. Once the newer process is in the lineage the surplus branches may be removed in a later change; that is not done here.

## Evidence

- The test passes against the evaluator now in the lineage, and against the proposed one in which review is a step and a third retrospective exists. Both runs end in the same nine passing cases.
- The state command prints no identity line in the lineage evaluator, so on it the fixture writes no round; the extra `retro-review.md` is ignored there.
- No file outside the test, this Change record and its seals is changed.
