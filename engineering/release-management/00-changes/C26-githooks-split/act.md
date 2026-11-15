# C26 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

Judging the dispatcher by running it against stub hooks, and against six known bad dispatchers, turned the CPO's fail-closed objection into one Case and a few lines, and later let the same Case move from the installed file to the Engineering source without change of meaning. Pinning the legacy hook by its sha256 meant the move could be shown byte for byte.

## Learned

The first plan put the installed `.githooks` tree into the collector's CHECK, and the Cases that judge it could only go green after an install that needed the collector on `main` first. The Owner's WIRE operation resolved this: the collector qualifies the source (T206, green), and the installed tree is the WIRE's verification (T207, T208 and release/T284), so the ACT does not wait for an install. The hook is a managed asset of Guard, and its acceptance (T5) had to learn the split layout first; that compatibility change reached the collector before anything else. A provisional ACT was the wrong answer to the circle and was withdrawn.

## Lacked

The WIRE pull request itself: the `wire/githooks-split` path, its Branching classification, its required check and a host adapter that takes the source and the legacy preimage from `main` rather than from the candidate. A way to test the dispatcher against the real `git push` of a clone before it is installed.

## Longed For

The first real WIRE, this dispatcher, run end to end into `.githooks`, with Guard acceptance on the installed tree. New hooks arriving as unchanged copies of Engineering sources under `new/pre-push.d/`, and the legacy checks retired one by one.
