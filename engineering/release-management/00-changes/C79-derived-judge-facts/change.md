# C79 change

## PLAN

1. Add the drafts in `interface.md` (Intent, Requirement, Architecture and the helper `derive.mjs`) and the Cases T1002 to T1004, all RED.
2. Observe the expected RED and that each Case can pass with the drafts as the DO's files (`evidence.md`).
3. The PLAN changes no judge, no declaration, no ruleset source, no shared helper and nothing under `.github`.

## Mechanism

`derive.mjs` returns `structuredClone(read(root))`, the facts of the checkout as the command line judge reads them, plus the judge itself. A positive Case calls `real()` and expects a pass. A negative Case calls `real()`, applies one small mutation of its own (a setting removed from the status-check rule of Integrating, one required check given another integration id, release/CTL1 removed from the controls) and expects the judge to fail naming that stage; it also expects the unmutated copy to pass, so a failure cannot come from the real tree. T1002 covers the derivation, T1003 the absence of the hand-kept lists, T1004 the negatives.

## Placement of the Cases

The Cases sit beside what they test: the derivation and the negatives in this Change's folder next to `derive.mjs`, which is the helper they test. The Cases of release/C35 and release/C70 stay where they are; the DO moves their positive inputs onto the derivation, as the migration of existing Cases one at a time, never leaving a Case without an input.

## Order with the other Changes

The collectors of release/C76, C77 and C78 are in the queue and each edits `helper.mjs` and `fixtures.mjs`. This Change is planned in parallel and its DO waits until all three are on `main`, so that the DO derives from the final sources and the three promotions are not disturbed. The PLAN alone touches no file they touch.

## Ids

Change `release/C79`, Intent `release/I44`, Requirement `release/F61`, Architecture `release/A56`, Gap `release/G102`, Cases T1002 to T1011 (three used), reserved by the release thread on 18 Nov 2026. No control.

## DO

Not authorized by this PLAN. On the merged PLAN, into the collector of this Change, after release/C76, C77 and C78 are on `main`: merge `main`, add `I44.md`, `F61.md`, `A56.md` and `derive.mjs` equal to the drafts, move the positive inputs of the judge Cases onto `real()`, remove the `CONTROLS` lists, rename T1002 to T1004 from `.red.mjs` to `.test.mjs` when green.

## ACT

A 4L retrospective in `act.md`.

## Left open

- Whether the negative Cases of release/C76, C77 and C78 are rewritten on `real()` or kept as they are: the DO decides Case by Case, and a negative Case that is kept stays independent of the sources.
