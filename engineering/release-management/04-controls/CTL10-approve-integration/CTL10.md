---
id: release/CTL10
title: approve Integration
description: It stops a merge into an integration branch that has no fresh approval of its exact head.
type: preventive
status: implemented
has: [release/I36]
---
# release/CTL10 approve Integration

A preventive control. The `integrating` ruleset requires one approving review and dismisses an approval when a commit is pushed after it, for every pull request into `kaal/**`, `hotfix/**` and `wire/**`. Its bypass list is empty: no actor, bot or person, skips it. A SYNC into `hotfix/**` or `wire/**` is approved by the bot of release/CTL8 when it is a verified pure SYNC, or by a person.

The requirement is stated in the ruleset source, `05-src/wiring/rulesets/integrating.json`. It operates only once the Owner has loaded it into the live `integrating` ruleset, after the sync bot's first live approval, and the old integration ruleset's approval rule is removed only after this one is proven equivalent, alone and never reducing protection. Until then no operation is claimed.

It has one Intent, release/I36.
