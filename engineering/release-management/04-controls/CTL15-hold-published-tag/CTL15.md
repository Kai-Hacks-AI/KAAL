---
id: release/CTL15
title: hold Published Tag
description: It stops a published trial tag from being moved to another commit.
type: preventive
status: implemented
has: [release/I43]
---
# release/CTL15 hold Published Tag

A preventive control. The `publishing` tag ruleset on `refs/tags/trial-*@*` holds the `update` rule, so a published tag cannot be moved. The stage declares the rule in `stages.json` (`rules`, control release/CTL15) and `verify Stages (Promoting)` judges the source against it, as it judges the branch rulesets. Deleting and creating a tag are not restricted by this control.

The requirement is stated in `05-src/wiring/rulesets/publishing.json`. It operates only on the live ruleset the Owner has loaded. It has one Intent, release/I43.
