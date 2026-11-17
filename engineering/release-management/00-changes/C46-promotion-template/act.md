# C46 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The PROMOTION template now carries the single-promotion seat in its first row and the freshness check in its second, so a promotion cannot be opened without saying whether its source holds main's tip. The SYNC row is conditional: a Dependency row for the SYNC for PROMOTION (C45) when the source is behind, omitted when it is current. T663 tests both paths, the five-row and the six-row table, and T660 to T662 judge the chapters and the wording. All four went from RED to green with `05-src/wiring/templates/promotion.md`.

## Learned

The conditional row is the one place where the table is allowed to grow, and the Case has to say how: renumbered in sequence, Who `Dependency`, the pull request as `#<number>` in Details. The Successor row had to be written so that approval and merge stay separate: the merge releases the seat, and the WIRE or the next promotion is eligible on its own prerequisites, with nothing starting automatically. The promotion #1816 was opened by hand with the same two chapters, and the first Branching run failed in the usual race and passed on the next.

## Lacked

A check that the Dependency row's pull request is a merged SYNC. The Case judges the shape of the row, and the Reviewer judges the content.

## Longed For

The promotion of this collector, and then its own WIRE, defined and reviewed on its own. The Owner has ruled that WIRE travels alone, so no WIRE carries more than one template.

## Follow-ups

- Promote C46 with the other template collectors, in the CPO's order.
- Define the WIRE of the PROMOTION template as its own operation, with its own scope and review.
