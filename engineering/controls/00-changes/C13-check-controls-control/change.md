# C13 change

## PLAN

1. Add the gap G90 and the draft of `controls/CTL1` (`interface.md`), with the Cases T780 to T783. The Cases are `T<n>.red.mjs`.
2. Observe the expected RED against the C12 collector (`evidence.md`).
3. State the route to `main` (`promotion.md`).
4. The PLAN adds no control item, no hook, no workflow and no ruleset, and touches only `engineering/controls/`.

## DO

Not authorized by this PLAN. On the merge of this PLAN into the collector, which is the go for the DO:

1. Copy the draft unchanged to `04-controls/CTL1-check-controls/CTL1.md`. It has the Intent `controls/I7`, which C12 declared.
2. Rename the Cases from `T<n>.red.mjs` to `T<n>.test.mjs` when they are green. T780 and T782 sit beside the control and point back at it.
3. Show in `evidence.md` of the DO the Engineering check that ran T778 on a pull request, which is the ground for `status: running`.

## ACT

1. A 4L retrospective of the Change, delivered to `main`.

## Left open

- No Developing hook. It is early feedback only, and it is added by a Change of its own if a bad declaration ever slips through.
- Whether `tested` is reached is judged with the help of the Skill and decided by the CPO. This Change claims `running` only.
- A ruleset that requires the Engineering check is what makes a failure block a merge. That is another control and is not touched here.
