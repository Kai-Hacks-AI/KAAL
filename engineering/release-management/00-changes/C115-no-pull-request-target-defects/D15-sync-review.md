# release/D15: sync-review.yml uses pull_request_target

Owner: the release capability (release management owns Branching and its sibling gates, engineering/github). Raised on 21 November 2026 from Kai's standing rule, no pull_request_target, and Operations' count of five workflows on main.

## Record

```json
{
  "id": "release/D15",
  "context": "release (the workflow .github/workflows/sync-review.yml, verify Sync, approve Sync and review Sync; Intent release/I50)",
  "expected": "No workflow under .github/workflows uses the trigger pull_request_target (release/I50): a pull request does not start a run with the base branch's token, and the repository does not depend on a trigger GitHub blocks by default in public repositories from 2 December 2026 (the Owner rejected an exception).",
  "observed": "Three jobs split by what a token can do: `verify Sync` holds no token and reads the candidate as Git data; `approve Sync` and `review Sync` write to the pull request (approval, label, comment) and never fetch the candidate. Its trigger is `pull_request_target` (opened, synchronize, reopened, edited). It is one of five workflows that use the trigger on main (af8f396); release/CTL19 only stops the number from rising, and the target Case release/T1123 is held RED at five.",
  "where": ".github/workflows/sync-review.yml",
  "reach": ".github/workflows/sync-review.yml",
  "status": "confirmed",
  "tests": [
    "release/T1323"
  ]
}
```

## What is shown, and what is not

Shown: the workflow's top-level `on:` names the trigger, by the same reader release/CTL19 uses. One Defect for each workflow, because the remedy of each differs (what its token can do, what it reads, which check it supplies) and each is fixed and wired apart. The expectation is the same for all five: release/I50.

Not shown, and not decided here: how the workflow is to run without the trigger. Under `pull_request` the workflow file comes from the head commit, so a pull request could edit its own judge; the trust design is the remedy's, not this record's. State: `main`; the repository's gates, not a package.

## Cases

| Identity | Role | File |
| --- | --- | --- |
| release/T1323 | RED on `main`: sync-review.yml names pull_request_target as a trigger | T1323.red.mjs |
