# C118 interface

Drafts of the three elements the DO adds.

## Draft of I64.md

`````
---
id: release/I64
title: a pull request cannot change the judge that judges it
---
# release/I64 a pull request cannot change the judge that judges it

Contract: a gate that judges a pull request and that a branch ruleset relies on runs a definition the pull request cannot edit. Where a trigger runs the pull request's own copy of a workflow, the workflow only hands over data and the judgment runs from the default branch; a workflow that judges nothing and attests nothing may run as it is. Reason: with `pull_request_target` gone (release/I50), the trust it gave must come from the design, not from the trigger. Owner: release management.
`````

## Draft of F89.md

`````
---
id: release/F89
title: trusted-judgment
kind: functional
serves: [release/I64]
---
# release/F89 trusted-judgment

A judging gate has two parts: an untrusted part that starts from the pull request and holds no token, and a trusted part that runs from the default branch. The untrusted part hands over only the number of the pull request. The trusted part validates it, reacquires every fact itself from GitHub, reads the candidate's commits as Git data and never checks them out, builds or runs them, sets the check in progress before it reads anything, and completes it from its judgment; a failed, cancelled or unreadable run completes it as failed. One pull request is judged at a time and a run is not cancelled mid-run. A workflow that judges nothing and attests nothing, and whose loss or edit gains the author nothing, may run on `pull_request` with no permission.
`````

## Draft of A100.md

`````
---
id: release/A100
title: relay and handler
addresses: [release/F89]
parent: release/A72
---
# release/A100 relay and handler

The relay is a workflow on `pull_request` with `permissions: {}` that writes the pull request number to an artifact. The handler is a workflow on `workflow_run` of the relay, from the default branch, that validates the number, reads the pull request and the base through the API, fetches the head as Git data, runs the judge the default branch holds and reports the check. The pattern of change-isolation-review is the reference; the judges and facts of each gate stay in its own source under `engineering/github/`.
`````
