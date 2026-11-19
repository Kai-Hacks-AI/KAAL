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
