# C91 interface

Drafts as they are added in the DO. The Cases read them; the element Cases read the element's own file once it exists.

## Draft of CTL20.md

`````
---
id: release/CTL20
title: gate verify Triggers
description: It stops a promotion that adds a workflow using pull_request_target, or raises their number.
type: preventive
status: designed
has: [release/I50]
---
# release/CTL20 gate verify Triggers

A preventive control. The `promoting` ruleset requires `verify Triggers`, the report of release/CTL19, so a promotion into the default branch that adds a workflow using `pull_request_target`, or raises the number of workflows that use it, cannot merge. It fails closed: a promotion whose workflows cannot be read, whose head ref cannot be resolved or whose base holds no judge ends the check non-zero and does not merge, because UNKNOWN never passes. The report is the detection and stays release/CTL19; this control is the requirement that uses it.

The requirement is stated in the ruleset source, `05-src/wiring/rulesets/promoting.json`, and declared in `stages.json`. It operates only once the Owner has loaded that ruleset, by the ruleset update procedure, and the workflow that makes the check is installed, for the pull request and for the merge queue. Until then no operation is claimed. It does not touch `integrating`: a branch whose base holds no judge would fail closed there.

It has one Intent, release/I50. Whether a use of the trigger can reach `main` in a promotion is answered from the Intent, by its Requirements and Architecture, not stated here.
`````

## Draft of F68.md

`````
---
id: release/F68
title: gate-verify-triggers
kind: functional
serves: [release/I50]
---
# release/F68 gate-verify-triggers

The check of release/F67, named `verify Triggers`, is required by the promoting ruleset, from the integration of the other required checks, so a pull request into the default branch that adds a use of `pull_request_target`, or raises their number, cannot merge. The check reports for a pull request and for a merge queue entry, because a required check that does not report in the queue holds it. The name the ruleset requires is the name of the job of the workflow, never a name kept by hand. A change that cannot be read, or a base that holds no judge, fails the check; UNKNOWN never passes. The requirement changes no other setting of the ruleset and does not apply to the integration branches.
`````

## Draft of A63.md

`````
---
id: release/A63
title: gate-verify-triggers
addresses: [release/F68]
---
# release/A63 gate-verify-triggers

The source `05-src/wiring/rulesets/promoting.json` lists `verify Triggers` as a third required check after `verify Stages (Promoting)` and `analyze Vulnerabilities (Promoting)`, with the same integration, and `stages.json` declares it in the Promoting stage's status-check rule, traced to release/CTL20, so `verify Stages` judges the source against the declaration. The workflow source `05-src/wiring/workflows/verify-triggers.yml` runs on `pull_request` and on `merge_group`: for a pull request it fetches the head from `refs/pull/<number>/head`, for a merge queue entry from `github.event.merge_group.head_ref`, in both cases as Git data, with the base commit checked out as the trusted judge. Installing the workflow under `.github/workflows` is a WIRE and loading the ruleset is the Owner's step; neither is part of this architecture.
`````

## Draft of promoting.json

`````
{
  "name": "promoting",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "exclude": [],
      "include": [
        "~DEFAULT_BRANCH"
      ]
    }
  },
  "bypass_actors": [],
  "rules": [
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": false,
        "do_not_enforce_on_create": false,
        "required_status_checks": [
          {
            "context": "verify Stages (Promoting)",
            "integration_id": 15368
          },
          {
            "context": "analyze Vulnerabilities (Promoting)",
            "integration_id": 15368
          },
          {
            "context": "verify Triggers",
            "integration_id": 15368
          }
        ]
      }
    }
  ]
}
`````

## Draft of stages-check.json

`````
{
  "name": "verify Triggers",
  "integration_id": 15368,
  "control": "release/CTL20"
}
`````

## Draft of verify-triggers.yml

`````
name: verify Triggers
# release/CTL19, required by release/CTL20. A detective check on plain pull_request and merge_group: no token, no secret, no pull_request_target (it is the rule it keeps).
# It runs the judge of the base and reads the change only as Git data: a pull request through refs/pull/<n>/head, a merge queue entry through its queue branch.
on:
  pull_request:
    branches: ['**']
  merge_group:
    types: [checks_requested]
permissions:
  contents: read
jobs:
  verify-triggers:
    name: verify Triggers
    runs-on: ubuntu-latest
    env:
      BASE_SHA: ${{ github.event.pull_request.base.sha || github.event.merge_group.base_sha }}
      PR_NUMBER: ${{ github.event.pull_request.number }}
      MERGE_GROUP_HEAD_REF: ${{ github.event.merge_group.head_ref }}
    steps:
      - name: Check out the base, the trusted judge
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1
        with:
          ref: ${{ github.event.pull_request.base.sha || github.event.merge_group.base_sha }}
          fetch-depth: 0
          persist-credentials: false
      - name: Fetch the proposed head as Git data
        run: |
          if [ -n "$MERGE_GROUP_HEAD_REF" ]; then
            git fetch --no-tags origin "+${MERGE_GROUP_HEAD_REF}:refs/remotes/pull/head"
          else
            git fetch --no-tags origin "+refs/pull/${PR_NUMBER}/head:refs/remotes/pull/head"
          fi
      - name: Judge
        run: |
          J=engineering/release-management/05-src/triggers/verify-triggers.mjs
          test -f "$J" || { echo "UNKNOWN: the judge is absent on the base"; exit 2; }
          node "$J" --base "$BASE_SHA" --head refs/remotes/pull/head
`````

