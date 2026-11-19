# C94 evidence

Observed on Node 22, on `main` 189662e plus this PLAN.

## Expected RED (the PLAN's tree)

Each of the four Cases was run alone and fails for the reason the PLAN states:

| Case | Result |
| --- | --- |
| T380 | `the verify Hotfix judge is absent` |
| T381 | `release/CTL21 is not listed` |
| T382 | `the verify Hotfix module is absent` |
| T383 | `the workflow source is absent` |

`node --test engineering/cases/cases.test.mjs` on this tree: 276 tests, 264 pass, 12 fail. The 12 also fail on `main`; this PLAN adds none. The `.red.mjs` files are ignored by the finders and the runner.

## Each Case can pass (throwaway copy)

In a throwaway copy of the tree with the DO's files taken from the drafts in `interface.md`, the F16 pointer sentence added and T380 to T383 renamed `.test.mjs`: all four pass. The runner on that copy: 280 tests, 268 pass, the same 12 fail. No other Case is affected.

## Found while writing the PLAN

The first draft of the workflow named `pull_request_target` in a comment. T383 refuses any mention of the trigger in the source, because a text count of the trigger is what release/CTL19 exists to avoid, and the comment now says "no privileged trigger".

## Retired with this Change

release/C31 (`kaal/hotfix/defect-only-diff`, PLAN #1691 merged into it, DO #1712 open, one commit ahead of `main` and 48 behind) is retired in favour of this Change on the Owner's direction of 19 Nov 2026. Its judge and Cases are the starting point of T380 and the module.
