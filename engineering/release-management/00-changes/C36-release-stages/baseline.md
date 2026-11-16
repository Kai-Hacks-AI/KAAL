# C36 baseline

The baseline is `main`. Work that is not on `main` is not delivered functionality.

- `packages/kaal-release` holds a Skill with a loop of decisions and two read-only Scripts. It has no Stage vocabulary and no declaration shape.
- `.kaal/config/guard/` shows how a consumer configures Guard with plain files. Nothing configures release stages.
- KAAL's own release controls (Engineering, release/C35) are written for KAAL and name GitHub and githooks directly.
