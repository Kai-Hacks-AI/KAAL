# C76 interface

Drafts as they are added in the DO. T972 to T974 read them. None of them is on the collector until the DO.

## Draft of I41.md

`````
---
id: release/I41
title: a stage's ruleset applies to every pull request into its branches and nobody skips it
---
# release/I41 a stage's ruleset applies to every pull request into its branches and nobody skips it

Contract: the ruleset of a delivery stage is active, applies to exactly the branches (or tags) of that stage, and lists no bypass actor. A ruleset that is switched off, evaluates only, covers other refs or can be skipped is no rule. Reason: the Owner's rulings of 17 Nov 2026 (no admin override, no bypass list) make the standing of a ruleset part of the control, not a side effect. Owner: release management.
`````

## Draft of CTL13.md

`````
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
`````

## Draft of F58.md

`````
---
id: release/F58
title: ruleset-standing
kind: functional
serves: [release/I41]
---
# release/F58 ruleset-standing

A ruleset source states `enforcement: active`, includes exactly the refs of its stage and lists no bypass actor, for each of Integrating, Collecting, Hotfixing, Wiring, Promoting and Publishing.
`````

## Draft of A53.md

`````
---
id: release/A53
title: ruleset-standing
addresses: [release/F58]
---
# release/A53 ruleset-standing

The stage declaration in `05-src/stages/stages.json` holds `standing` (`control`, `enforcement`, `bypass`) for each branch stage, its parts and Publishing; the refs come from the stage's `targets` or `target`. The judge `05-src/stages/judge.mjs` compares the source to it and traces `control` to a declared control that has an Intent. The sources under `05-src/wiring/rulesets/` are the code that answers the Cases.
`````

## The declaration

Each branch stage (Integrating, its parts Collecting, Hotfixing and Wiring, Promoting) and Publishing holds the same `standing` object beside its `targets` or `target`:

`````
{
  "standing": {
    "control": "release/CTL13",
    "enforcement": "active",
    "bypass": []
  }
}
`````

## The judge

For each ruleset the judge reads `standing` of its stage and passes the standing when: (1) `enforcement` of the source equals the declared `enforcement`; (2) `bypass_actors` of the source equals the declared `bypass`; (3) the refs of the source are exactly the stage's `targets` or `target` (as today); (4) `control` is a declared control that has at least one Intent. A stage without `standing`, a `standing` that is not an object, and a control that is undeclared or has no Intent are findings that name the ruleset and what differs. Nothing else in the judge changes.
