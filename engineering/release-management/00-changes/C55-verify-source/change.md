# C55 change

## PLAN

1. Add the drafts in `interface.md`: the control `release/CTL4`, the Intent `release/I29` and the interface of the judge.
2. Add the Cases T720 to T724, all RED: the control test (T720, beside the control), the Intent's answer (T721, beside the Intent), and three behaviour Cases of the judge (T722 to T724, in this folder).
3. Observe the expected RED (`evidence.md`), and that each Case can pass with the DO's content (`evidence.md`).
4. The PLAN adds no control item, no Intent item, no judge and no declaration. It changes no workflow, no ruleset, no package and nothing under `engineering/release/`.

## Ids

Allocated by the coordinator on 17 Nov 2026: Change `release/C55`, Cases T720 to T729 (five used), Intent `release/I29`, control `release/CTL4`. The gap `release/G84` is the next free in release.

## Design

The judge is rebuilt clean and not wrapped. It does not run anything: the run that calls it supplies a record of the source test run, and the judge decides on that record alone, so it is pure and testable without a package.

- The test command comes from a declaration (`verify-source.json`), not from a constant in the code (T724).
- The result is `verified`, `failed` or `unknown`. A run that left no record, or whose exit status is not a whole number, is `unknown`, never a pass. The old step knew only pass or stop.
- Each finding names its rule, so a ruleset, a report or a later Change can refer to it.

The rule is the one of engineering/F30: the declared command ran in the package's directory and exited 0. Locating the package (F28) and running the command belong to the run that calls the judge, and migrate with it.

## DO

Not authorized by this PLAN. On the go of the Owner, into the collector of this Change:

1. Add `05-src/publishing/verify-source/judge.mjs` and `verify-source.json` (the command `npm test`).
2. Add `04-controls/CTL4-verify-source/CTL4.md` and `01-intent/I29-source-tested/I29.md`, equal to the drafts.
3. Rename T720 to T724 from `.red.mjs` to `.test.mjs` when they are green.

## ACT

A 4L retrospective in `act.md` before the promotion.

## Left open

- Which run calls the judge. Today engineering/F30 in `engineering/release/` does, through the old workflow. A run in release-management that calls it is a later Change of the migration, after which the old engine's source test step leaves.
- The order of the remaining controls of `engineering/release/` (pack once, installed verification, publish gate, registry acceptance), each its own Change.
- A preventive control that wires CTL4 into a release run or a ruleset: a separate, second control, and an explicit decision of the Owner.
