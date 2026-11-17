# C58 baseline

The baseline is the collector `kaal/release/sync-review` at `main` 42e5b2a, with no commit of its own.

- `engineering/github/lineage.ts` has a `synchronization` verdict, run by the check `Branching` for a pull request into any branch but `main`. It says a SYNC is a valid step: a merge commit that gives the lineage a newer state of `main`, with its own Changes kept and its resolutions named. It admits resolutions, and it only reports: nothing acts on it.
- `.github/PULL_REQUEST_TEMPLATE/sync.md` has the chapters `Change` and `Reason`. The Reason states why the SYNC is needed.
- `04-controls/` holds release/CTL1 and release/CTL2, and release/CTL6 is planned on `kaal/release/scan-vulnerabilities`. No control reads a SYNC for purity, and none acts on a SYNC.
- Every SYNC is approved by a person, and a later catch-up merge dismisses the approval. SYNC #1841 into `kaal/release/promotion-template` is open as this PLAN is written.
- The set 1 `integrating` ruleset (`engineering/rulesets-set-1/integrating.json`) has a required-checks rule and no pull request rule. What the old integration ruleset (24952357) requires of `kaal/**`, a review or a Code Owner review, is not recorded.
