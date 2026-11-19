# C27 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

Splitting the Cases into two groups removed the circle at once: the collector Cases judge the source, the WIRE Cases judge the install, and neither waits for the other. Judging the judge on known good and bad installs before trusting it, the same way the dispatcher was judged, made the CPO's questions about preimages and undeclared files answerable by a fixture rather than by an argument.

## Learned

The first plan reproduced the circularity it set out to remove, because two of its Cases asked for an installed tree. A Case that is green only after an install belongs to the install, not to the collector. The CPO's two corrections, a declared sha256 preimage instead of a generic exemption for a move and `wire/<name>` into a protected `main` instead of a collector, each changed the design in a way I had not seen from the inside. GitHub rulesets match the target branch, so one protection policy on `main` with delivery-type-sensitive checks is the only workable shape. A new pull request's first Branching run fails before auto-merge registers, and a toggle produces stale failing runs, so a red Branching right after a toggle is not a verdict.

## Lacked

The host adapter that supplies trustworthy bytes of the source and the preimage from `main`: the judge takes them as inputs, and fixtures are not operational enforcement. The classification of `wire/<name>` in Branching, the required check and the enforcement on `main`. A bootstrap path for the template that does not weaken `main`.

## Longed For

One reviewed DO for the WIRE enforcement on `main`, tested outside the live rulesets, failing closed for an unclassified pull request. The first real WIRE, C26's dispatcher, run end to end as the proof of the path.

## Renumbering

The Cases T209 to T212 collided with Guard's release C143 Cases T209, T210, T211 and T213, and Case ids are globally unique. They are renumbered T281 to T284 (T209 to T281, T210 to T282, T211 to T283, T212 to T284), with no change to their content. Ids T277 to T279 are used by the pull-declare PLAN; T281 to T284 were free on every remote branch when checked.
