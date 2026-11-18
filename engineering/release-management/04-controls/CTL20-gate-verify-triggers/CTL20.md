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
