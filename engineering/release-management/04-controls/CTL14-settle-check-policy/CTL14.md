---
id: release/CTL14
title: settle Check Policy
description: It stops a required-check rule from forcing a catch-up with the base, and from blocking the creation of a work branch.
type: preventive
status: implemented
has: [release/I42]
---
# release/CTL14 settle Check Policy

A preventive control. The status-check rule of each ruleset states the policy: `strict_required_status_checks_policy` is `false` everywhere, and `do_not_enforce_on_create` is `true` for the work-branch rulesets and `false` for the promoting ruleset. The stage declares each setting with this control in `stages.json` (`settingControls`) and `verify Stages` judges the source against it.

The requirement is stated in the ruleset sources under `05-src/wiring/rulesets/`. It operates only on the live rulesets the Owner has loaded. It has one Intent, release/I42.
