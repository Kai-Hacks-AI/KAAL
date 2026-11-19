---
id: release/CTL19
title: verify Triggers
description: It reveals whether a change adds a workflow that uses pull_request_target, or raises their number.
type: detective
status: designed
has: [release/I50]
---
# release/CTL19 verify Triggers

A detective control and a ratchet. `verify Triggers` compares the workflows of the base with those of the head and says FAIL when the count of workflows that use `pull_request_target` rises or a workflow that did not use it on the base uses it on the head. The base branch is the baseline, so removing a use passes and the count only goes down. It says PASS when neither happens, and UNKNOWN when a side could not be read, which never passes. PASS is not an approval and not a merge decision.

It runs on a plain `pull_request` with no token, in the Integrating and Promoting stations once wired. It reads the base commit and the proposed head ref as Git data and runs the base's judge, never a file of the pull request, fork pull requests included. It judges nothing else: it does not say whether a workflow is safe, only which trigger it names. Making it a required check is another control with its own Owner decision. When the count is 0 the target Case of this control asserts it, and the ratchet then keeps it at 0.

It has one Intent, release/I50.
