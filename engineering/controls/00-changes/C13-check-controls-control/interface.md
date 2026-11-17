# C13 interface

The control this Change declares in the DO, as a draft for review. The DO copies it unchanged to `04-controls/CTL1-check-controls/CTL1.md`, and the Case T780 compares the two.

## Draft of CTL1.md

````
---
id: controls/CTL1
title: check Controls
description: It reveals when a control declaration is incomplete.
type: detective
status: running
has: [controls/I7]
---
# controls/CTL1 check Controls

A detective control. The Engineering check runs the check of the controls Skill on the controls of `engineering/`, and fails, naming each missing or invalid field with a recovery, when a declaration is incomplete. An incomplete control stays in the inventory. It blocks nothing by itself: the Engineering check goes red, and a ruleset that requires that check is what would stop a merge, which is another control with its own Owner decision.

It has one Intent, controls/I7. Whether a claimed status is true is not decided here: it is judged with the help of the Skill, and this control only reveals a declaration that is incomplete.
````

## Why `running`

The Engineering check runs the Case T778 on every pull request that carries it, so the mechanism already runs on its boundary and reports. It is not `tested` as a control until a Case shows it revealing a failure on its own declaration (T782), and that claim is judged by the CPO, not by this file.
