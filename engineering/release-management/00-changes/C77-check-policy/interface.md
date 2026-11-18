# C77 interface

Drafts as they are added in the DO. T982 to T984 read them. None of them is on the collector until the DO.

## Draft of I42.md

`````
---
id: release/I42
title: a pull request is judged on its own head, and a work branch can be created before it has any check
---
# release/I42 a pull request is judged on its own head, and a work branch can be created before it has any check

Contract: a required check judges the head the pull request has, not a head forced to catch up with its base; and a new work branch can be created before it has any check, while the default branch cannot. Reason: a forced catch-up merge dismisses the approval of the exact head (the Owner's rule: no "up to date" in the new rulesets), and a collector or hotfix branch exists before its first push can run a check. Owner: release management.
`````

## Draft of CTL14.md

`````
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
`````

## Draft of F59.md

`````
---
id: release/F59
title: check-policy
kind: functional
serves: [release/I42]
---
# release/F59 check-policy

The status-check rule of each ruleset source states `strict_required_status_checks_policy: false`; the four work-branch rulesets state `do_not_enforce_on_create: true` and the promoting ruleset `false`.
`````

## Draft of A54.md

`````
---
id: release/A54
title: check-policy
addresses: [release/F59]
---
# release/A54 check-policy

The rule declaration in `05-src/stages/stages.json` holds `settingControls`, the control that answers for each of the rule's `parameters` that is not a check list. The judge `05-src/stages/judge.mjs` requires every such parameter to have an entry traced to a declared control that has an Intent. The sources under `05-src/wiring/rulesets/` are the code that answers the Cases.
`````

## The declaration

The status-check rule of every branch stage (the checks stay as release/C70 declares them) holds `settingControls`; Promoting's `do_not_enforce_on_create` is `false`:

`````
{
  "rules": [
    {
      "type": "required_status_checks",
      "control": "release/CTL1",
      "parameters": {
        "strict_required_status_checks_policy": false,
        "do_not_enforce_on_create": true
      },
      "settingControls": {
        "strict_required_status_checks_policy": "release/CTL14",
        "do_not_enforce_on_create": "release/CTL14"
      },
      "checks": [
        "\u2026as declared by release/C70"
      ]
    }
  ]
}
`````

## The judge

For each declared rule the judge requires every key of `parameters` other than a check list to have an entry in `settingControls`, and each entry to name a declared control that has at least one Intent. A parameter without an entry, an entry for a parameter that is not declared, and an entry that traces to an undeclared control or to one without an Intent are findings that name the setting. The values of the settings are still compared as release/C70 does. The rule's own `control` keeps answering for the rule type and its checks.
