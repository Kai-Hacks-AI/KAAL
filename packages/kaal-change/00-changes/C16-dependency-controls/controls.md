# Drafts of the control records of change/C16

The DO writes these at `packages/kaal-change/14-operations/controls/`.

## CTL1-check-predecessor/CTL1.md

```
---
id: change/CTL1
title: check Predecessor
description: It reveals when a hard predecessor a Change declares is not on main at its pin or carried together.
type: detective
status: designed
has: [change/I33]
evidence: [fixture:8, real:1, provoked:1:fail]
---
```

A detective control. For the Changes under check it says PASS (every declared predecessor is satisfied: on main, or carried in the same promotion and delivered, not merely matching its pinned bytes; or none declared, which claims nothing), FAIL naming the Change and the predecessor (unresolved, stale, elsewhere, undelivered, or a format finding of the reader), or UNKNOWN naming what it cannot read. It gates nothing.

## CTL2-identify-conflict/CTL2.md

```
---
id: change/CTL2
title: identify Conflict
description: It reveals when two open Changes claim the same path and whether a declared edge orders them.
type: detective
status: designed
has: [change/I33]
evidence: [fixture:6, real:1, provoked:1:fail]
---
```

A detective control. Over the claimed paths and records of the open Changes it says PASS (no shared path, or every shared path resolved by synchronization), FAIL naming the path and both Changes and whether a declared edge orders them (a shared path that is not resolved; ordering is not resolution), or UNKNOWN naming the Change whose paths it cannot read. It gates nothing.
