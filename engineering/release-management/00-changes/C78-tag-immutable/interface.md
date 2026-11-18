# C78 interface

Drafts as they are added in the DO. T992 to T994 read them. None of them is on the collector until the DO.

## Draft of I43.md

`````
---
id: release/I43
title: a published trial tag names the same commit for good
---
# release/I43 a published trial tag names the same commit for good

Contract: a published trial tag (`trial-*@*`) names the same commit for good; it cannot be moved. Reason: a published version is a claim about one commit, and moving the tag would make it a different claim under the same name. Owner: release management.
`````

## Draft of CTL15.md

`````
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
`````

## Draft of F60.md

`````
---
id: release/F60
title: published-tag
kind: functional
serves: [release/I43]
---
# release/F60 published-tag

The `publishing` source holds exactly one rule, `update`, on `refs/tags/trial-*@*`, with no bypass actor.
`````

## Draft of A55.md

`````
---
id: release/A55
title: published-tag
addresses: [release/F60]
---
# release/A55 published-tag

The Publishing stage in `05-src/stages/stages.json` declares `rules` like a branch stage: the rule `update`, its control and its (empty) settings. The judge `05-src/stages/judge.mjs` compares the source to the declaration and traces the control to a declared control that has an Intent. `05-src/wiring/rulesets/publishing.json` is the code that answers the Cases.
`````

## The declaration

The Publishing stage keeps `kind`, `target` and `rule` (compatibility with main's judge, as release/C70 kept `requires` and `also`) and adds `rules`, declared as a branch stage declares them:

`````
{
  "name": "Publishing",
  "kind": "tag",
  "target": "trial-*@*",
  "rules": [
    {
      "type": "update",
      "control": "release/CTL15",
      "parameters": {}
    }
  ],
  "standing": "as release/C76 declares it, when that is on main"
}
`````

## The judge

The judge reads `rules` of the Publishing stage and compares the rule types of the `publishing` source to them, any order; each declared rule's settings (`parameters`) equal the source's; and each rule's `control` is a declared control that has at least one Intent. A source with a rule the stage does not declare, a declared rule the source lacks, and a control that is undeclared or has no Intent are findings reported by the Promoting job, as Publishing is today. The key `rule` is no longer read by the new judge.
