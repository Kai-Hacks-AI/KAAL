# C10 interface

The draft of the first control, as it is declared in the DO. Case T540 reads it. It is not a control on `main` until the DO.

## Draft of CTL1.md

````
---
id: release/CTL1
title: verify Stages
description: It reveals when a delivery stage differs from the stages declaration.
type: detective
has: [release/I27]
---
# release/CTL1 verify Stages

A detective control. `Engineering / verify Stages (<Ruleset>)` judges the sources of the delivery stages against `05-src/stages/stages.json` and fails when a stage differs. It blocks nothing by itself: a ruleset that requires the check is what makes a failure stop a change, and that is another control.

It has one Intent, release/I27. Whether the stages are as the strategy says is answered from the Intent, by its Requirements and Architecture, not stated here.
````

## Where it lives

`engineering/release-management/04-controls/CTL1-verify-stages/CTL1.md`, with its control test `T540.test.mjs` beside it. The numbered folder `04-controls` is proposed here for the CPO to judge: it is the free number between `03-architecture` and `05-src`. The finder reads frontmatter and not paths, so the folder can change later without changing a control.
