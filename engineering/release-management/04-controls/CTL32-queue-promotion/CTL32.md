---
id: release/CTL32
title: queue Promotion
description: It lands a promotion on the current tip of main, one at a time, by squash.
type: preventive
status: designed
has: [release/I63]
evidence: [fixture:2, real:2, provoked:1:fail]
---
# release/CTL32 queue Promotion

A preventive control. The `promoting` ruleset holds a merge queue for the default branch: one entry is built and merged at a time, on the current tip of `main`, and it lands by squash. Its bypass list is empty.

The requirement is stated in the ruleset source, `05-src/wiring/rulesets/promoting.json`, and declared in `05-src/stages/stages.json`. It operates only once the Owner has loaded it into the live `promoting` ruleset; the queue of the old promotion ruleset is removed only after this one is proven equivalent, alone and never reducing protection. Until then no operation is claimed.

It has one Intent, release/I63.
