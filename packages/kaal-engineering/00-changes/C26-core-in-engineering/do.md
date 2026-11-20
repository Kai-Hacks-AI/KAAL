# C26 do

The DO moves Core out of `.kaal/`, as the PLAN said.

## What was done

- The eleven files moved with `git mv`, content unchanged: `.kaal/AGENTS.md` and `.kaal/KAAL-KERNEL.md` to `engineering/core/`, and the nine Nodes of `.kaal/core/` to `engineering/core/core/`.
- The root `AGENTS.md` names `engineering/core` and `engineering/core/AGENTS.md`.
- In `engineering/acceptance/embed.test.mjs`, the scenario "this repository's own Engine" reads the Engine from `engineering/core`, and the assertion that compared its `AGENTS.md` with the packed Core is dropped. The routing and the "repeats none of the Engine's notes" assertions stay, and so do the scenarios that install the packed package into a fresh host.
- `.gitattributes` marks `engineering/core/**` as `-text`, as `.kaal/**` was: a Node is its exact bytes, so Git must not rewrite its line endings on any host. The first Acceptance run on Windows failed on this, because the moved files lost that protection.
- T1239 and T1240 renamed from `.red.mjs` to `.test.mjs`.

## Boundaries kept

`.kaal/config/` and `.kaal/changes/` are untouched. No other package, no lane, no ruleset, no wiring, no publication. The delivery-locations file still lists `.kaal/core` and is not changed here.

## Evidence

T1239 and T1240 are GREEN. The amended scenario needs the packed packages and is checked by the Acceptance lane, not run in this checkout.
