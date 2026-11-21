# C106 baseline

The baseline is the collector `kaal/release/stage-ruleset-names` at `main` ff6926c, with no commit of its own.

- The six sources hold `name` as `integrating`, `collecting`, `hotfixing`, `wiring`, `promoting`, `publishing`.
- `05-src/stages/judge.mjs` requires `r.name === name.toLowerCase()` for each branch ruleset and `p.name === "publishing"` for the tag ruleset. `stages.json` declares no ruleset name.
- Cases that assert the lowercase names or compare a source to a draft that holds them: release/T481, T487, T862 and T1132. Every other Case reads the sources through the shared helper and is unaffected.
- Runner on this baseline: 314 tests, 298 pass, 16 fail (the same 16 fail on main).
