# release/D16: change-isolation.yml uses pull_request_target

Owner: the release capability (release management owns Branching and its sibling gates, engineering/github). Raised from Kai's standing rule, no pull_request_target, and Operations' count of five workflows on main.

## Record

```json
{
  "id": "release/D16",
  "context": "release (the workflow .github/workflows/change-isolation.yml, Change Isolation (Core and .github travel alone); Intent release/I50)",
  "expected": "No workflow under .github/workflows uses the trigger pull_request_target (release/I50): a pull request does not start a run with the base branch's token, and the repository does not depend on a trigger GitHub blocks by default in public repositories from 2 December 2026 (the Owner rejected an exception).",
  "observed": "It checks out the default branch, fetches the candidate as Git data to list its changed paths and judges them with the checker the target branch holds. Its trigger is `pull_request_target` (opened, synchronize, reopened, edited). It is one of five workflows that use the trigger on main; release/CTL19 only stops the number from rising, and the target Case release/T1123 is held RED at five.",
  "where": ".github/workflows/change-isolation.yml",
  "reach": ".github/workflows/change-isolation.yml",
  "status": "confirmed",
  "reproduction": "On main, read .github/workflows/change-isolation.yml with the reader of release/CTL19 (`uses` in engineering/release-management/05-src/triggers/verify-triggers.mjs): it answers true. The same read over the whole directory lists five workflows, and release/T1123, held RED, fails with that list."
}
```

## What is shown, and what is not

Shown: the workflow's top-level `on:` names the trigger, by the same reader release/CTL19 uses (see the reproduction). One Defect for each workflow, because the remedy of each differs (what its token can do, what it reads, which check it supplies) and each is fixed and wired apart. The expectation is the same for all five: release/I50.

Not shown, and not decided here: how the workflow is to run without the trigger. Under `pull_request` the workflow file comes from the head commit, so a pull request could edit its own judge; the trust design is the remedy's, not this record's. State: `main`; the repository's gates, not a package.

## Case

None yet, on purpose. The Case ships as a plain `.test.mjs` in the Change that fixes this workflow, together with its source, so it is never RED on a collector. The reproduction above is the RED-on-main evidence.
