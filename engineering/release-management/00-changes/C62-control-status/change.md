# C62 change

## PLAN

1. Add the drafts in `interface.md`.
2. Add the Cases T810 and T811, both RED (`evidence.md`).
3. Observe the expected RED, and that each Case can pass with the DO's content.
4. The PLAN changes no finder, no control and no Case of another Change.

## Ids

Allocated by the coordinator on 17 Nov 2026: Change `release/C62`, Cases T810 to T819 (two used). No gap id.

## DO

On the merged PLAN, into the collector of this Change, apply `controls/C12-status-on-main.patch` as the controls thread delivered it (the diff of main to the finished tree of controls/C12, 33 files, in `/mnt/project-files/controls/`): the finder, the Skill pointers and `check-controls.mjs`, the amended old Cases, and the status of release/CTL1, CTL2, CTL7, CTL8 and CTL9 with T540, T600 and T750 to T752 ignoring the status line. Rename T810 and T811 from `.red.mjs` to `.test.mjs` when green.

Any file this Change changes is changed identically in controls/C12, or its SYNC stops being a pure merge.

## ACT

A 4L retrospective in `act.md` before the promotion.

## Left open

- Whether the status of a control is checked at a gate: controls/C12 and the Owner decide, not this Change.
