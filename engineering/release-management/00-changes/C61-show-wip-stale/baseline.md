# C61 baseline

The baseline is `main`. Work that is not on main is not delivered functionality.

- `packages/kaal-release/skills/kaal-release/scripts/show-wip.mjs` builds the inventory of release/C39: one entry per branch with its transports, and the overview of counts per place. It knows nothing about whether a branch holds work.
- `engineering/release-management/05-src/show-wip/read.mjs` reads the branch names only.
