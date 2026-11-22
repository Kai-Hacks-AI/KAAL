# C24 do

The DO adds the layout reference to the kaal-engineering Skill and nothing else, as the PLAN said.

## What was added

- `skills/kaal-engineering/references/package-layout.md` and `package-layout.json`, moved from `draft/`: one layout for `packages/`, `engineering/` and `.kaal/`, machinery and content, controls, the four `AGENTS.md`, and what verifies each element.
- One heading and one link in `skills/kaal-engineering/SKILL.md`.
- T1220 to T1229 renamed from `.red.mjs` to `.test.mjs`.
- The `draft/` folder is removed: its content is now the real files.

## Boundaries kept

No migration of any package, including Hosting. No script, no control, no publication, no change to the root workspace list and no change outside `packages/kaal-engineering/`.

From the CPO's approval of the PLAN:

- Shipping `dist/AGENTS.md` does not activate its instructions in a consumer context. Placement and applicability are for delivery and WIRE (see kaal-release), not for this reference.
- The source file of the generated `dist/AGENTS.md` stays a design decision for the Change that builds `dist`. The template says only that it is built from `13-source`.

## Evidence

All ten Cases are GREEN where the package's dependencies are installed (`evidence.md`).
