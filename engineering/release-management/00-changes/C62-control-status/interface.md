# C62 interface

## The finder

A control declares `status` beside id, title, description, type and has. The finder lists the control with its `status` and its `rank` (designed 1, implemented 2, running 3, tested 4). A control with a missing or unknown status stays listed and says so in `problems` (`valid` is false); it is not dropped. The finder is the one of controls/C12, byte for byte.

## The release controls

`status: implemented` on release/CTL2, CTL5, CTL7, CTL8 and CTL9, and `status: running` on release/CTL1 (DIRT of 17 Nov 2026), as a line between `type` and `has`. The Cases of those controls that compare the control with its draft ignore that line, as the draft predates the status.

## What else moves

The Skill pointers (`SKILL.md`, `references/declaring-controls.md`, `references/judging-status.md`), the script `check-controls.mjs` they point at, and the old controls Cases T470 to T479, T530 to T536 and T12 that read the finder, as controls/C12 holds them.
