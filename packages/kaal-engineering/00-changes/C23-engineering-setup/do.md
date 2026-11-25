# C23 DO

The DO adds the private package `@kaihacksai/kaal-engineering` and nothing else, as the PLAN said.

## What was added

- `package.json`: private, scoped name, `files` holding `payload` and `skills` only, and a `test` script that runs the Cases as `kaal-controls` does.
- `payload/Engineering.md`: the Skill Node, typed by Core's `KAAL Skill`. It says the capability owns the enduring ratchet concept and points the other concepts to their owners.
- `skills/kaal-engineering/SKILL.md`: the Skill, from the reviewed draft, with the ratchet stated as this capability's.
- `README.md`, `LICENSE`, `test/cases.test.mjs`.
- T1171 to T1179 renamed from `.red.mjs` to `.test.mjs`.
- The `draft/` folder is removed: its content is now the real files.

## Not done

No control, no script, no code, no publication, no change to the root workspace list, no change to `.agents`, `.claude`, `.github` or `.githooks`, and no change to kaal-engineer-skill.

## Evidence

All nine Cases are GREEN where the package's dependencies are installed (`evidence.md`). The Engineer Skill's checker exits 0 on the Skill.
