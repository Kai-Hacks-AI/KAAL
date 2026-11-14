# C26 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it. This ACT is provisional: it is a checkpoint, not a conclusion. Installation is pending; T206–T208 are not green on main. C26 is not complete, and the collector is not concluded.

## Liked

Judging the dispatcher by running it, against six known bad dispatchers, made the CPO's fail-closed objection answerable at once: the fix was one Case and a few lines, not an argument. Pinning the legacy hook by its checksum meant the move could be shown byte for byte instead of described.

## Learned

The hook is a managed asset of Guard, and Guard's own acceptance reads `.githooks/pre-push`, so a split of `.githooks` cannot go green alone: the compatibility change has to reach main first, and `.githooks` cannot share a promotion with engineering files. The sequence therefore runs engineering to main, then a SYNC of the wiring collector, then the exact-head check. A new pull request's first Branching run fails before auto-merge registers, and a disable event produces a stale failing run, so a red Branching right after a toggle is not a verdict.

## Lacked

A way to judge the installed split before it is on main: T206–T208 judge the real tree, so they cannot be green in the engineering collector. A rule for wiring Changes on how the ACT and the green Cases are ordered, which cost one ruling.

## Longed For

The hook sources tested upfront under `05-src/wiring/hooks/`, so the next hook arrives as an unchanged copy. Guard acceptance that does not name the layout of `.githooks`.

## Pending

Once the installed split is on main: run T206–T208 against that tree, rename them to `.test.mjs` only when green, and amend this ACT with the actual evidence in a subsequent Engineering Change.
