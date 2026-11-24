---
id: release/CTL1
title: verify Stages
description: It reveals when a delivery stage differs from the stages declaration.
type: detective
status: running
has: [release/I27]
evidence: [fixture:2, real:1, provoked:1:fail]
---
# release/CTL1 verify Stages

A detective control. `Engineering / verify Stages (<Ruleset>)` judges the sources of the delivery stages against `05-src/stages/stages.json` and fails when a stage differs. It blocks nothing by itself: a ruleset that requires the check is what makes a failure stop a change, and that is another control.

It has one Intent, release/I27. Whether the stages are as the strategy says is answered from the Intent, by its Requirements and Architecture, not stated here.
