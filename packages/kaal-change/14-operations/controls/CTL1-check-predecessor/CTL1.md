---
id: change/CTL1
title: check Predecessor
description: It reveals when a hard predecessor a Change declares is not on main at its pin or carried together.
type: detective
status: designed
has: [change/I33]
evidence: [fixture:8, real:1, provoked:1:fail]
---
# change/CTL1 check Predecessor

A detective control. For the Changes under check it says PASS (every declared predecessor is satisfied: on main, or carried in the same promotion and delivered, not merely matching its pinned bytes; or none declared, which claims nothing), FAIL naming the Change and the predecessor (unresolved, stale, elsewhere, undelivered, or a format finding of the reader), or UNKNOWN naming what it cannot read. It gates nothing.

Judge: `lib/check-predecessor.mjs`. Entry: `13-source/controls/run-check-predecessor.mjs`.
