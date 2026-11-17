# C49 change

## PLAN

1. Add the draft of the control in `interface.md`, the control test T600 (beside the control, reading the draft) and the answering Case T601 (beside the Intent). The control itself, `release/CTL2`, is not added by the PLAN, so that both Cases run RED.
2. Observe the expected RED (`evidence.md`).
3. The PLAN adds no control item, no finder change and no Skill text. It changes no workflow, check, judge or ruleset. No new Intent is added: `release/I4` already states the contract.

## Ids

Allocated by the coordinator on 16 Nov 2026: Change `release/C49`, Cases T600 to T609 (two used: T600, T601), control `release/CTL2`, gap `release/G72`. The Intent is the existing `release/I4`, so no new Intent id is used.

## DO

Not authorized by this PLAN. On the go of the Owner, into the collector of release/C48:

1. Add `04-controls/CTL2-analyze-vulnerabilities/CTL2.md`, equal to the draft.
2. Rename T600 and T601 from `.red.mjs` to `.test.mjs` when they are green.

## ACT

A 4L retrospective in `act.md` before the promotion. C48 and C49 promote together.

## Left open

- Whether Requirements and Architecture of release/I4 reach the control: later Changes.
- Any ruleset that requires the reports stays a separate preventive control with its own Owner decision.
