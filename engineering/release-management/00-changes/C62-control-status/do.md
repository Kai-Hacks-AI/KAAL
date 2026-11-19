# C62 do

## What the DO added

- The finder that reads `status` (`find-controls.mjs` of the controls package), `check-controls.mjs`, the Skill pointers (`SKILL.md`, `references/declaring-controls.md`, `references/judging-status.md`) and the old controls Cases that read the finder, as the controls thread delivered them in the patch of controls/C12, applied to this tree without its six files for CTL7, CTL8 and CTL9 and their Cases (which `main` changed after the patch was cut).
- `status: running` on release/CTL1 and `status: implemented` on release/CTL2, CTL5, CTL7, CTL8 and CTL9, as a line before `has`. For CTL7, CTL8 and CTL9 and CTL5 this was done by hand; T540, T600, T730 and T750 to T752 leave the status line out of the compared text, as the drafts predate it.
- T810 and T811 renamed from `.red.mjs` to `.test.mjs`. Both are green. T811 lists CTL5 beside CTL1, CTL2, CTL7, CTL8 and CTL9.
- The descriptive text of the PLAN (C62.md, interface.md) names CTL5 beside the others.

## Checked beside the Cases

- The Cases runner (`engineering/cases/cases.test.mjs`): 195 pass, 12 fail; the 12 are the unnamed Cases of `collector-capability/00-changes/C15-collector-capability` (T268 to T279), which fail on `main` too.

## Not done, as planned

No control moves beyond Implemented, and nothing is wired. The DIRT status declares where a control stands; it does not prove it protects anything.
