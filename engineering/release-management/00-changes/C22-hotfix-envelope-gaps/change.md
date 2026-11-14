# C22 change

## PLAN

1. Add C22 with the gap Case T192 and the Case T191 (the judge). Both are RED on `main` (`evidence.md`).
2. A pull request whose head is under `hotfix/` takes the TYPE HOTFIX. Any other TYPE from such a head is a finding.
3. A HOTFIX needs content in its Defect, Urgency and Approach chapters, and its Change chapter is one non-empty line of the form `<id> <name>` (release/F16).
4. A HOTFIX result lists, under not judged, whether the change corrects only its defect and whether its Defect and Urgency are true, beside the base and the Change identity already listed. The verdict of a HOTFIX stays UNKNOWN.

## DO

1. Change `envelope.mjs` for steps 2 to 4 and F17 for the same rules.
2. The delivered Cases that build a HOTFIX with a Change chapter of another shape are changed in the same DO to follow step 3, and the DO names them.
3. Rename T191 and T192 to `.test.mjs` when green.

## ACT

1. A 4L retrospective in `act.md`.

## Not in this Change

A required defect reference or evidence field in the Defect chapter: it amends release/F16 and is a separate CPO decision. The Hotfix delivery path, its base, controls and admission. The `Driven-by` agreement of a HOTFIX. Wiring, hooks, CI, merge blocking, promotion and npm publication.
