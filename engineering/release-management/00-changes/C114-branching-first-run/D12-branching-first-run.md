# release/D12: the Branching verdict of a new pull request can be a stale failure

Owner: the release capability (the Branching gate and its workflow, engineering/github). Raised on 21 November 2026 from the Promoting flow, where the first Branching run of a new or un-drafted PROMOTION fails and auto-merge has to be switched off and on, about 35 seconds apart and several times, before the check passes.

## Record

```json
{
  "id": "release/D12",
  "context": "release (the Branching workflow .github/workflows/lineage-synchronization.yml; the gate engineering/github/branching.md, auto-merge)",
  "expected": "A pull request whose auto-merge is enabled with the method its flow lands by has a passing Branching verdict as soon as the run that follows the enabling has finished. No later or older run can leave a failure that enabling auto-merge does not replace.",
  "observed": "Branching runs once per event (opened, edited, synchronize, auto_merge_enabled, auto_merge_disabled) with no ordering between the runs of one pull request, and takes the auto-merge from the event payload (KAAL_AUTO_MERGE = github.event.pull_request.auto_merge.merge_method). A pull request cannot be opened with auto-merge on, so the run of `opened` judges auto-merge as none and fails (`Auto-merge is disabled for this pull request`); the run of auto_merge_enabled passes. Whichever run finishes or starts last decides, and a run for an older event judges the auto-merge that event carried, not the one the pull request has. Runs of one head on 21 Nov: 9419 failure, 9420 success, 9421 failure, 9422 success (act-lib PROMOTION); 9438 failure, 9439 failure, 9440 success, 9441 failure, 9442 success (engineering PROMOTION).",
  "where": ".github/workflows/lineage-synchronization.yml (no concurrency, and the KAAL_AUTO_MERGE line of the judging step)",
  "status": "confirmed",
  "tests": ["release/T1320"]
}
```

## What is shown, and what is not

Shown: the verdict is judged from the event's copy of auto-merge, and nothing orders or supersedes the runs of one pull request. The first run of every new pull request fails by design of the gate until auto-merge is on; the defect is that this failure can be the one that stays.

Not shown: which ordering produced each stuck failure. Case T1320 judges the two causes in the workflow, not a race on GitHub's side. The live proof is the next PROMOTION on `main`: one run per event, auto-merge enabled once, the check green without cycling.

## Cases

| Identity | Role | File |
| --- | --- | --- |
| release/T1320 | RED on `main`: the workflow has no per-pull-request concurrency and judges auto-merge from the event; GREEN with the correction | T1320.test.mjs |

State: `main`. No package or production state is affected.
