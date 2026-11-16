# C8 do

## What the DO added

- `skills/kaal-controls/scripts/find-controls.mjs` (A8): the pure `findControls(files)` and a command line entry that prints `{ controls, refused }` as JSON.
- `skills/kaal-controls/references/declaring-controls.md`: how to declare a control and run the finder.
- One line in `skills/kaal-controls/SKILL.md` that points to the reference. The PLAN said a short chapter in the Skill. A6 caps the Skill at 600 words and it stood at 598, so the chapter went into a reference file and two words of the Skill's own text were dropped to make room (599 words).
- The Cases T470 to T479 renamed from `.red.mjs` to `.test.mjs`. They run with the package's own test (`node --test test/cases.test.mjs`), and all 21 Cases of the package pass.

## Not done, as planned

No control item exists yet, no concern folder is chosen, the finder resolves no Intent and checks no gate, and nothing is published or wired into root CI.
