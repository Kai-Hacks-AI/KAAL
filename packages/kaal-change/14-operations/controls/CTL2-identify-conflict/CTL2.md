---
id: change/CTL2
title: identify Conflict
description: It reveals when two open Changes claim the same path and whether a declared edge orders them.
type: detective
status: designed
has: [change/I33]
evidence: [fixture:6, real:1, provoked:1:fail]
---
# change/CTL2 identify Conflict

A detective control. Over the claimed paths and records of the open Changes it says PASS (no shared path, or every shared path resolved by synchronization), FAIL naming the path and both Changes and whether a declared edge orders them (a shared path that is not resolved; ordering is not resolution), or UNKNOWN naming the Change whose paths it cannot read. It gates nothing.

Judge: `lib/identify-conflict.mjs`. Entry: `13-source/controls/run-identify-conflict.mjs`.
