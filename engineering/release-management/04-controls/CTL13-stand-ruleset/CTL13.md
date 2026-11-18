---
id: release/CTL13
title: stand Ruleset
description: It stops a stage's ruleset from being switched off, widened or bypassed.
type: preventive
status: implemented
has: [release/I41]
---
# release/CTL13 stand Ruleset

A preventive control. Every ruleset of the new set stands: its `enforcement` is `active`, its `conditions.ref_name.include` is exactly the refs of its stage, and its `bypass_actors` is empty. The stage declares this as `standing` in `stages.json` (control, enforcement, bypass) and `verify Stages` judges each source against it, so a source that is evaluate-only, covers other refs or lists a bypass actor fails the stage's check. The refs of a stage are its `targets` or `target`.

The requirement is stated in the ruleset sources under `05-src/wiring/rulesets/`. It operates only on the live rulesets the Owner has loaded; nothing is claimed for a ruleset that is not loaded. It has one Intent, release/I41.
