# C50 change

## PLAN

1. Add the drafts in `interface.md`: the control `release/CTL3`, the Intent `release/I28` and the interface of the judge.
2. Add the Cases T610 to T614, all RED: the control test (T610, beside the control), the Intent's answer (T611, beside the Intent), and three behaviour Cases of the judge (T612 to T614, in this folder).
3. Observe the expected RED (`evidence.md`), and that each Case can pass with the DO's content (`evidence.md`).
4. The PLAN adds no control item, no Intent item, no judge and no declaration. It changes no workflow, no ruleset, no package and nothing under `engineering/release/`.

## Ids

Allocated by the coordinator on 16 Nov 2026: Change `release/C50`, Cases T610 to T619 (five used), Intent `release/I28`, control `release/CTL3`. The gap `release/G73` is the next free in release.

## Design

The judge is rebuilt clean and not wrapped. What changes against `engineering/release/release.mjs`:

- The scope and the repository come from a declaration (`readiness.json`), not from constants in the code, so the judge names no repository (T614).
- The result is `verified`, `failed` or `unknown`. A registry that was not asked about the package or one of its dependencies is `unknown`, never a pass. The old engine reported that as one more finding.
- Each finding names its rule, so a ruleset, a report or a later Change can refer to it.

The rules are the ones of engineering/F29. The package-locating step (F28) and the registry reading belong to the run that calls the judge, and migrate with it.

## DO

Not authorized by this PLAN. On the go of the Owner, into the collector of this Change:

1. Add `05-src/publishing/readiness/judge.mjs` and `readiness.json` (the scope `@kaihacksai/` and the repository of this project).
2. Add `04-controls/CTL3-readiness-before-pack/CTL3.md` and `01-intent/I28-publishing-intact/I28.md`, equal to the drafts.
3. Rename T610 to T614 from `.red.mjs` to `.test.mjs` when they are green.

## ACT

A 4L retrospective in `act.md` before the promotion.

## Left open

- Which run calls the judge. Today engineering/F29 in `engineering/release/` does, through the old workflow. A run in release-management that calls it is a later Change of the migration, after which the old engine's readiness leaves.
- The order of the remaining controls of `engineering/release/` (source tests first, pack once, installed verification, publish gate, registry acceptance), each its own Change.
- Whether CTL3 should also be required by a ruleset: a separate decision.
