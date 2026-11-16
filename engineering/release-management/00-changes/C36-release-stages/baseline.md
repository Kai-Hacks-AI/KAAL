# C36 baseline

The baseline is `main`. Work that is not on `main` is not delivered functionality.

- `packages/kaal-release` holds a Skill with a loop of decisions and two read-only Scripts. It has no Stage vocabulary and no declaration shape.
- `.kaal/config/guard/` shows how a consumer configures Guard with plain files. Nothing configures release stages.
- release/C35 (`05-src/stages/stages.json` and `judge.mjs`) declares KAAL's own activities, Developing, Integrating with Collecting, Hotfixing and Wiring, Promoting and Publishing, together with their GitHub targets and checks. It is KAAL's GitHub-bound data and is not a consumer's declaration.
