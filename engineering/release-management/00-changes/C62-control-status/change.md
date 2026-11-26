# C62 change

## PLAN

1. Add the drafts in `interface.md`.
2. Add the Cases T810 and T811, both RED (`evidence.md`).
3. Observe the expected RED, and that each Case can pass with the DO's content.
4. The PLAN changes no finder, no control and no Case of another Change.

## Ids

Allocated by the coordinator on 17 Nov 2026: Change `release/C62`, Cases T810 to T819 (two used). No gap id.

## DO

On the merged PLAN, into the collector of this Change, apply `controls/C12-status-on-main.patch` as the controls thread delivered it (the diff of main to the finished tree of controls/C12, 33 files, in `/mnt/project-files/controls/`): the finder, the Skill pointers and `check-controls.mjs`, the amended old Cases, and the status of release/CTL1, CTL2, CTL7, CTL8 and CTL9 with T540, T600 and T750 to T752 ignoring the status line. The patch does not apply to the six files of CTL7, CTL8 and CTL9 and their Cases, which `main` changed after it was cut (release/C60, release/C65): the DO excludes those six from the patch and makes the same change by hand, a `status: implemented` line before `has` and the status line left out of the compared text in T750 to T752. The DO also declares `status: implemented` for release/CTL5, which is on `main`, with the same comparison in T730. Rename T810 and T811 from `.red.mjs` to `.test.mjs` when green.

The collector is built from `main`, so no SYNC is needed before its promotion; whether controls/C12 changes the same files identically is for its own PROMOTION to settle.

## ACT

A 4L retrospective in `act.md` before the promotion.

## Left open

- Whether the status of a control is checked at a gate: controls/C12 and the Owner decide, not this Change.
