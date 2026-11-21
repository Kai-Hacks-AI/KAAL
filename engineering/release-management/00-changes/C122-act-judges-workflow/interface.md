# C122 interface

## Draft of I65.md

`````
---
id: release/I65
title: act-is-judged-where-it-is-made
kind: intent
---
# release/I65 act-is-judged-where-it-is-made

The ACT of a collector is judged where it is made: every pull request into a collector is asked the four questions of the ACT (is the work held, is the retro demanded, is it well formed, did the pull request stay in its folders), and the answers are shown on the pull request. A control is made sharper only on evidence of real runs.
`````

## Draft of F90.md

`````
---
id: release/F90
title: act-judges-run-on-collector-pull-requests
kind: functional
serves: [release/I65]
---
# release/F90 act-judges-run-on-collector-pull-requests

A workflow runs hold Act, demand Act, verify Act and limit Act on every pull request into a collector, each as a job of its own, with the default branch's judge over the pull request's merge result as data. The verdict is written to the job's summary. With the flag of the judge exactly `on`, a FAIL or an UNKNOWN that applies fails the job; otherwise the job passes whatever the verdict. A pull request that is not an ACT is reported as such and passes. No ruleset requires any of the four jobs.
`````

## Draft of A101.md

`````
---
id: release/A101
title: act-judges-workflow
kind: architecture
implements: [release/F90]
---
# release/A101 act-judges-workflow

`05-src/wiring/workflows/act-judges.yml` (event `pull_request`, branches `kaal/**`, `permissions: {}` beyond `contents: read`) checks out the default branch and the merge result of the pull request into a second folder, and runs `05-src/phase/run-act-judges.mjs <judge>` once per job. The runner reads the two folders through `05-src/phase/lib/tree-facts.mjs`, asks the judge of `05-src/phase/` and prints its verdict; the flag `KAAL_RELEASE_<CONTROL>` set by the Owner as a repository variable decides only the exit code.
`````
