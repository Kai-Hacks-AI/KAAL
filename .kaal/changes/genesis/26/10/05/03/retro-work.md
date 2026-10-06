# Retro

## Learned

I treated the red isolation check as an obstacle to explain, and it was telling me something true about the work: I had folded two Changes into one, defining a rule and then changing the machinery that enforces it in the same step. A rule has to exist before something can consume it, and a Change that edits its own judge cannot be judged by it. I also learned that the predicate stayed small the whole time. The code, the tests and the refusals did not change when the boundary of the Change did, which suggests the semantics were right and only the packaging was wrong. And I learned that a Change can be reopened before it is admitted, when its closure turns out to have been premature, which I had assumed was not possible once I had closed it.

## Liked

That the evaluator's own words for each stage became the refusal reasons, so I wrote almost no wording of my own for what an open Change lacks. That the tests drive the command against tiny hand-written KAAL directories and read as a list of what an admission may and may not be. And that the parts removed from this Change moved to their own branch without touching a line of the predicate.

## Lacked

A moment before closing at which I looked at the Change's boundary rather than its content. I closed it with host controls and a rule about them still inside, and only a reviewer's reading of the red check showed me that they belonged to a different Change. I also lacked a plain account of how to reopen an unadmitted Change: I worked it out from the commands and from an earlier Change's notes about replacing a Work seal.

## Longed

For the support engine and the semantics it enforces to be separable by a check I can run myself before proposing, so that a Change that mixes them is visible to me while it is still staged and not only at the review of the pull request.
