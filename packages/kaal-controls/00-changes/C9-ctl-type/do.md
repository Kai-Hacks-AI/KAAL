# C9 do

## What the DO added

- `skills/kaal-controls/scripts/find-controls.mjs` (A9): `type` is the fifth field of a control. It is mandatory, must be one of `directive`, `preventive`, `detective` or `corrective`, is returned on each listed control, and refuses the item whole, naming `type`, when missing or other.
- `skills/kaal-controls/references/declaring-controls.md`: the `type` line and what it means. `SKILL.md` is unchanged and stays at 599 words.
- `02-requirements/F13-control-shape/F13.md` now lists `type` among the fields and points to F16, so F13 and F16 do not contradict.
- The Cases T470 to T479 of C8 build their controls with a `type`, since a control without one is now refused. Their assertions are unchanged.
- The Cases T530 to T536 renamed from `.red.mjs` to `.test.mjs`. All 28 Cases of the package pass with `node --test test/cases.test.mjs`.

## Not done, as planned

No creation command, no enforcement, no lifecycle state and no further relationship. The finder still resolves no Intent and checks no gate. Nothing is published or wired into root CI.
