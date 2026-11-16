# C42 transition

1. Parallel run: the new stage-named checks report beside the old `Dependency Review` job. No ruleset requires either until the Owner's go.
2. Equivalence: on the same pull requests the new check and the old job reach the same verdict (the replay of release/C5 `transition.md`).
3. Owner's go: the two contexts are added to `integrating` and `promoting`.
4. Retirement: after a clean run, `dependency-review.yml` goes in its own WIRE. The old three rulesets are not touched by this Change.

Fallback: remove the contexts from the two rulesets; the old job is still there until step 4.
