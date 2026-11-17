# C66 interface

Drafts as they are added in the DO. T860 to T864 read them. None of them is on the collector until the DO.

## Draft of I36.md

`````
---
id: release/I36
title: a merge into an integration branch needs a fresh approval
---
# release/I36 a merge into an integration branch needs a fresh approval

Contract: a pull request into an integration branch (`kaal/**`, `hotfix/**` or `wire/**`) merges only with an approving review of its exact head. A push after the approval makes it stale, and a stale approval does not count. No actor, bot or person, skips the rule. Reason: otherwise it is too easy to forge success from development into an integration branch. Owner: release management.
`````

## Draft of CTL10.md

`````
---
id: release/CTL10
title: approve Integration
description: It stops a merge into an integration branch that has no fresh approval of its exact head.
type: preventive
has: [release/I36]
---
# release/CTL10 approve Integration

A preventive control. The `integrating` ruleset requires one approving review and dismisses an approval when a commit is pushed after it, for every pull request into `kaal/**`, `hotfix/**` and `wire/**`. Its bypass list is empty: no actor, bot or person, skips it. A SYNC into `hotfix/**` or `wire/**` is approved by the bot of release/CTL8 when it is a verified pure SYNC, or by a person.

The requirement is stated in the ruleset source, `05-src/wiring/rulesets/integrating.json`. It operates only once the Owner has loaded it into the live `integrating` ruleset, after the sync bot's first live approval, and the old integration ruleset's approval rule is removed only after this one is proven equivalent, alone and never reducing protection. Until then no operation is claimed.

It has one Intent, release/I36.
`````

## Draft of integrating.json

`````
{
  "name": "integrating",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "exclude": [],
      "include": [
        "refs/heads/kaal/**",
        "refs/heads/hotfix/**",
        "refs/heads/wire/**"
      ]
    }
  },
  "bypass_actors": [],
  "rules": [
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": false,
        "do_not_enforce_on_create": true,
        "required_status_checks": [
          {
            "context": "verify Stages (Integrating)",
            "integration_id": 15368
          },
          {
            "context": "verify Stages (Developing)",
            "integration_id": 15368
          }
        ]
      }
    },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 1,
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": false
      }
    }
  ]
}
`````

## Draft of the stage declaration

The `Integrating` entry of `stages.json` gains one key; the name follows the precursor Change.

`````
"alsoRules": ["pull_request"]
`````
