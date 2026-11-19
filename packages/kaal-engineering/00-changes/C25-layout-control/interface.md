# C25 interface

Drafts as they are added in the DO. None of them is on the collector until the DO; T1237 reads the control from its final path.

## Draft of `packages/02-controls/CTL2-verify-layout/CTL2.md`

`````
---
id: engineering/CTL2
title: verify Layout
description: It reveals when a capability folder does not follow the layout template.
type: detective
status: designed
has: [engineering/I4]
evidence: [fixture:2, real:1, provoked:1:fail]
---
# engineering/CTL2 verify Layout

A detective control. `verify Layout` reads the tracked files of a capability folder and the layout template of the kaal-engineering Skill, and says whether the folder follows it. PASS: no tracked file breaks the template. FAIL: a numbered folder the template does not have, an element folder or the source without the folder that verifies it, a stray folder inside `13-source`, or a committed `dist`. UNKNOWN: the template or the folder cannot be read; that never counts as a pass.

It reveals; it gates nothing, writes nothing and runs nothing in the folder. It judges one folder and says nothing about the others, so a run over every capability gives the baseline the ratchet tightens against: the number of failing folders may only go down. Making it preventive is a different control with the same check, made only after this one is Tested and the Owner decides.

It declares its own minimum evidence in the kinds controls/F30 asks of every control: two runs against a fixture (one correct setup, GREEN, and one bad setup, RED), one real run over a capability folder of this repository, and one provoked failure (a bad setup made on purpose, RED, and GREEN once it is put right).

It has one Intent, engineering/I4.
`````

## Draft of `skills/kaal-engineering/scripts/check-layout.mjs`

In `draft/skills/kaal-engineering/scripts/check-layout.mjs`, for review only.
