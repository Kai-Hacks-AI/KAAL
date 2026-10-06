# Retrospective-name bridge for the containment test

## Intent

Let the containment test's fixture take each Change it builds through the process whichever evaluator defines it, including an evaluator whose third retrospective is the Owner's and is named `retro-owner.md`. This is a support-engine change: it touches the test beneath the admission gate and nothing else. It follows the earlier compatibility bridge, whose Work is sealed and stays as it is.

## Requirements

R1. Where the evaluator reports the identity of `work/` (`work: <identity>`), the fixture writes `retro-review.md` and `retro-owner.md` after `retro-work.md`; where it does not, it writes `retro-review.md` and `retro-observe.md`, as before.

R2. Every case of the test keeps its name, its stage names and its expectation. No case is added, removed, relaxed or skipped.

R3. Nothing outside the test file changes, and the present process is used to close this Change.

## Architecture

The fixture already reads the identity line from the state command to decide on a review round. The same value decides the name of the last retrospective: an evaluator that reports an identity has review as a step and names its third retrospective for the Owner; one that does not names it for the observer. The stage name `retro-observe` that the cases use is kept as the label of "all retrospectives written"; only the file written under it depends on the evaluator.

## Evidence

- The test passes against the evaluator now in the lineage, and against the proposed one in which review is a step and the Owner's retrospective is `retro-owner.md`, ending in the same passing cases on both.
- No file outside the test, this Change record and its seals is changed.
