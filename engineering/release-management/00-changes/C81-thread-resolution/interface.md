# C81 interface

Drafts as they are added in the DO. The change-oriented Cases (T1046 and T1047) and the drafts' own files read them; the element Cases (T1042 to T1045) read the element's own properties once it exists. None of them is on the collector until the DO.

## Draft of I46.md

`````
---
id: release/I46
title: a review thread on an integration pull request is resolved before it merges
---
# release/I46 a review thread on an integration pull request is resolved before it merges

Contract: a pull request into an integration branch (`kaal/**`, `hotfix/**` or `wire/**`) does not merge while a review thread on it is unresolved. Bot output, such as the review of a SYNC or an analysis report, is a plain comment or a check and never an inline review thread, so a SYNC is never held by a thread only a person could resolve. Reason: a question a reviewer raised must be answered before the change lands; the old integration ruleset already requires it. Owner: release management.
`````

## Draft of F63.md

`````
---
id: release/F63
title: thread-resolution
kind: functional
serves: [release/I46]
---
# release/F63 thread-resolution

The pull request rule of the `integrating` ruleset sets `required_review_thread_resolution` true, for the same targets, with no bypass actor, and changes none of its other settings. The stage declaration states the same value. No workflow that a stage runs creates an inline review thread.
`````

## Draft of A58.md

`````
---
id: release/A58
title: thread-resolution
addresses: [release/F63]
---
# release/A58 thread-resolution

One setting in `05-src/wiring/rulesets/integrating.json`, declared in the `Integrating` entry of `05-src/stages/stages.json` under release/CTL10, which `verify Stages` judges against the source. The workflows of `.github/workflows` and `05-src/wiring/workflows` are the facts for the bot boundary.
`````

## Draft of CTL10.md

`````
---
id: release/CTL10
title: approve Integration
description: It stops a merge into an integration branch that has no fresh approval of its exact head or an unresolved review thread.
type: preventive
status: implemented
has: [release/I36, release/I46]
---
# release/CTL10 approve Integration

A preventive control. The `integrating` ruleset requires one approving review and dismisses an approval when a commit is pushed after it, and requires every review thread to be resolved, for every pull request into `kaal/**`, `hotfix/**` and `wire/**`. Its bypass list is empty: no actor, bot or person, skips it. A SYNC into `hotfix/**` or `wire/**` is approved by the bot of release/CTL8 when it is a verified pure SYNC, or by a person. Bot output is a plain comment or a check and never an inline review thread, so no thread holds a SYNC.

The requirement is stated in the ruleset source, `05-src/wiring/rulesets/integrating.json`. It operates only once the Owner has loaded it into the live `integrating` ruleset, after the sync bot's first live approval, and the old integration ruleset's approval rule is removed only after this one is proven equivalent, alone and never reducing protection. Until then no operation is claimed.

It has two Intents, release/I36 (a fresh approval) and release/I46 (resolved threads).
`````

## Draft of the integrating.json change

The `pull_request` rule of `integrating.json` is as in release/C66 with one setting changed. Every other key stays as it is on `main`:

`````
"required_review_thread_resolution": true
`````

## Draft of the stage declaration

The same single value in the `pull_request` rule of the `Integrating` entry of `stages.json`, so the declaration and the source agree:

`````
"required_review_thread_resolution": true
`````
