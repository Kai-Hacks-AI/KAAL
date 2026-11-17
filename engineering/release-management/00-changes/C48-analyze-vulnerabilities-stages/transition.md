# C48 transition

1. Parallel run: the new stage-named checks report beside the old `Dependency Review` job. No ruleset requires either; that is not decided here.
2. Equivalence evidence, all of it observable and recorded in `acceptance.md` before the old workflow is retired: (a) the same verdict on every pull request seen in the parallel run, each by number, covering a pull request into `kaal/**`, into `hotfix/**`, into `wire/**` and into `main`, with a PR that carries a finding and one that is clean; (b) on a real merge-queue run, the check reports on the merge group and its verdict equals the pull request's; (c) the run URLs and check-run names as GitHub reports them. One clean run is not enough by itself.
3. Reporting is detective. Requiring the contexts in `integrating` or `promoting` would be enforcement: a separate preventive control, decided explicitly by the Owner, not by this Change.
4. Retirement: only when step 2 is fully recorded, `dependency-review.yml` goes in its own WIRE. The old three rulesets are not touched by this Change.

Fallback: remove the two stage-named jobs; the old job is still there until step 4.
