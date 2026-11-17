# C12 change

## PLAN

1. Add I7, F19, F20, N7 and A10 with their Cases T770 to T775 and the gap G89 under `packages/kaal-controls/`. The Cases are `T<n>.red.mjs`.
2. Observe the expected RED against `main` (`evidence.md`).
3. State the route to `main` (`promotion.md`).
4. The PLAN adds no finder change, no control item and no Skill text, touches nothing outside `packages/kaal-controls/`, and cites nothing that is not on `main`.

## DO

Not authorized by this PLAN. On the merge of this PLAN into the collector, which is the go for the DO:

1. Add `status` to the finder (A10): mandatory, one of the four values, listed on each control, refused whole otherwise.
2. Add the `status` line and the four values in order to `references/declaring-controls.md`. `SKILL.md` keeps its word cap.
3. Give the Cases of C8 and C9 that build a control (T470 to T479, T530 to T536) a `status`, since a control without one is now refused.
4. Rename the Cases from `T<n>.red.mjs` to `T<n>.test.mjs` when they are green.
5. Declarations that are already on `main`, `release/CTL1` and `release/CTL2`, are refused by the finder until they declare a `status`. See "Left open".

## ACT

1. A 4L retrospective of the Change, delivered to `main`.

## Left open

- The existing declarations. The finder refuses a control without `status`, so a control on `main` that does not declare one disappears from the list and shows as refused. Proposal: each owner adds one `status:` line to its control in a small change of its own, before C12 is promoted for the controls on `main` (today `release/CTL1`, `release/CTL2`), and when its collector next moves for a control that is still on a collector (CTL3 to CTL9, merging `main` brings the finder). C12 edits no control of another capability.
- How a status is judged true is not decided here. controls/F12 keeps claims calibrated, and a `tested` status needs evidence that the owner of the control can show.
