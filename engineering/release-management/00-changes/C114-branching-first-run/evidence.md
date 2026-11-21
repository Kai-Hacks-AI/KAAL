# C114 evidence

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T1320 | release/D12 | RED: the workflow has no source under 05-src/wiring/workflows |

1 RED-observed, 0 error, 0 green.

## Can the Case pass

In a throwaway copy of `main` with T1320 renamed to `.test.mjs` and the source added (the installed workflow with the two corrections of the hotfix track), the Case is green. Two mutations of that source are each caught: `cancel-in-progress: false`, and the line that sets `KAAL_AUTO_MERGE` from the pull request removed.

## What this shows and does not show

That the source says what the Defect asks. It does not show that the Branching check passes on the first run of a pull request: that is observed on the first pull request into a collector after the WIRE.
