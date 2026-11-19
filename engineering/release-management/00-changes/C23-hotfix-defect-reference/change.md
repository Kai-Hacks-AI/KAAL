# C23 change

## PLAN

1. Add C23 with the Cases T193 and T194, and the gap Case T195.
2. The Cases are RED against `main` (`evidence.md`).
3. The requirement to state: the Defect chapter references one KAAL Defect by its identity `<capability>/D<n>`. A GitHub issue or a URL is not that identity and may not stand in for it. The reference belongs to the Defect chapter alone; Urgency keeps why the ordinary path cannot be followed, and Approach keeps the choice of correction.

## DO

1. Amend F16 to state the requirement, and the Defect hint of the template draft in `00-changes/C11-hotfix/interface.md` to ask for the KAAL Defect identity. Rename T193, T194 and T195 from `.red.mjs` to `.test.mjs`.
2. The delivered Case T181 of release/C17 compares the installed template with that draft, and T152 asserts the Defect hint of the installed template. Neither is changed here. The installed template follows the draft through release/C17, which is held, so C17 and this Change are ordered by the Owner, not decided here.

## ACT

1. A 4L retrospective in `act.md`, landing in the collector before its promotion.

## Not in this Change

A check of the reference, the existence or state of the named Defect, the envelope check, the Hotfix delivery path, the registry of PR templates, and the installation of the template.
