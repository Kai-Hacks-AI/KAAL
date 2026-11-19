# C44 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The ACT template's Successor row says what the merge does and does not do: the collector becomes eligible for PROMOTION when it is complete, and the merge never promotes. That keeps promotion a decision of its own, in line with "develop now, wait only at promotion". T640 to T642 turned green with `05-src/wiring/templates/act.md`.

## Learned

An ACT is the last PR on a collector, so its table is the only place where the hand-over to PROMOTION is written down. The Predecessor row names the DO, and the Successor row names the promotion queue, so a reader does not need the Definition to follow the chain.

## Lacked

A way to see, from the ACT PR alone, whether the collector is complete. The table says it in words; no check reads it.

## Longed For

The WIRE of all six templates in one pass, and a promotion template whose Dependency row can point at the ACT of the collector it promotes.

## Follow-ups

- Promote C44 with the other template collectors, in the CPO's order.
- WIRE the ACT template to `.github/PULL_REQUEST_TEMPLATE/act.md`; it travels alone.
