# C17 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The wiring shrank to one claim, that the installed bytes equal the draft, and one Case, T181, says it and breaks when a single line is appended. Following the pattern of release/C16, the `.github` part and the engineering part travelled in two collectors, and Change Isolation never objected.

## Learned

The CPO's decision of 13 Nov is that qualification is completed in the collector and that the installed template reaches `main` only as a delivery consequence, so the CHECK is run against the collector's effective target state, not against `main`. I had planned T181 to verify after promotion and had to revise the sequence. I also synchronized both collectors in parallel at a moment when nothing was promoting. The Owner's rule is to sync only right before a collector's own promotion, once the previous one has landed, or to unblock development, so one of the two syncs was wrong and I closed it. Two Owner decisions then arrived that bear on this Change: no PR template registry, and a KAAL Defect reference in the Defect chapter, which release/C23 now plans.

## Lacked

A statement in the PLAN of a wiring Change of when its CHECK runs and against which state. A CI check that runs a Case over two collectors at once, so the CHECK is a manual run recorded in `evidence.md`. A clear order between this Change and release/C23, which amends the draft this Change installs.

## Longed For

A CHECK that judges the effective target state of a pair of collectors without a hand-made tree. A rule written down before the first sync, so that I ask whether a sync is needed instead of discovering it from a review.
