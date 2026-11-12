# C7 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The template being three short chapters. Once the CPO had narrowed the contract to Change, Implement and Refactor, every later review round was about wording and none about structure. Cases that import only what they use were quick to read and quick to run.

## Learned

Delivery cost more than the Change. The template is thirteen lines, yet it needed two collectors, two promotions and two syncs, because each promotion must contain the tip of main and main moved after every merge. The first Branching run on a new pull request fails before auto-merge is registered, and enabling auto-merge is what runs it again. The tool that enables auto-merge reports a merge commit for pull requests into main although the merge queue squashes; only the ruleset shows the real method.

## Lacked

A way for me to set squash auto-merge on a promotion, and to see the method the queue will use. A single statement of the order in which a split Change travels: sync, promote, sync, promote. I was told it in pieces, and in the meantime opened two promotions at once, which could not both be fresh.

## Longed For

A promotion that is judged fresh against the queue's base instead of failing on the pull request and needing a separate sync. One place that shows which pull requests of a Change are open, behind or waiting for approval. Collectors that follow main without a pull request of their own.
