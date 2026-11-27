---
name: kaal-defect
description: Derive each Defect's state from the Test Cases that point at it and list the unresolved Defect inventory. Use to read what a context's Defect records and their Test Cases show at a revision.
license: MIT
---

# KAAL Defect

A Defect is a passive description of an undesirable condition. It has no known, fixed or open state of its own: its state is derived from the Test Cases that point at it. Use this Skill to read what Defect records and their Test Cases show at a revision, and to list the unresolved Defects.

Always true:

- A Test Case points at a Defect with its first line, `// Case <id> tests: <defect id>`.
- The state (`confirmed`, `answered` or `unknown`) is derived each time from the run records of the revision judged, and never written on the Defect. Missing, stale or incomplete evidence is `unknown`, never `RED` or `GREEN`.
- The Defect record is authoritative. Keep no second list of Defect ids.
- A location that cannot be discovered is incomplete discovery, never an empty inventory.

Read the part the task needs:

- `references/edge-and-scope.md`: how a Case points at a Defect, and a Defect's scope.
- `references/state.md`: how the state is derived, and what it does not decide.
- `references/inventory.md`: where Defects are recorded, and where the correction belongs.
- `references/use.md`: the script, its inputs, output and exit status.
