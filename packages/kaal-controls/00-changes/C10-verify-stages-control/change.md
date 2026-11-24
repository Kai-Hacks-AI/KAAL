# C10 change

## PLAN

1. Add the Intent `release/I27` (stages intact) under `engineering/release-management/01-intent/`, with its Case T541.
2. Add the draft of the control in `interface.md`, and the control test T540, which reads the draft. The control itself, `release/CTL1`, is not added by the PLAN, so that both Cases run RED.
3. Observe the expected RED against `main` (`evidence.md`).
4. State the route to `main` (`promotion.md`).
5. The PLAN adds no control item, no finder change and no Skill text, and cites nothing that is not on `main`. It changes no check, judge, ruleset or workflow.

## Ids

The Owner's coordinator allocated them on 16 Nov 2026: Change `controls/C10`, Cases T540 to T549 (two are used: T540, T541), Intent `release/I27`, control `release/CTL1`. The gap `controls/G6` is the next free in controls. The Change adds no Requirement or Architecture id: it adds no new product behaviour, as release/C38 did. The release capability's thread owns its ids and was told by the coordinator.

## DO

Not authorized by this PLAN. On the go of the Owner, into the collector of this Change:

1. Add `engineering/release-management/04-controls/CTL1-verify-stages/CTL1.md`, equal to the draft in `interface.md`.
2. Rename T540 and T541 from `.red.mjs` to `.test.mjs` when they are green.

## ACT

A 4L retrospective in `act.md` before the promotion.

## Left open

- The numbered folder for control items. `04-controls` is proposed for the CPO to judge. The finder reads frontmatter, so a change of folder changes no control.
- Which Requirements and Architecture the Intent reaches, and whether the control covers a gate: later Changes. The control points only at its Intent.
- The second control, `analyze Vulnerabilities`, is the next Change.
- The rename to `@kaihacksai/kaal-controls` is its own small Change after this one.
