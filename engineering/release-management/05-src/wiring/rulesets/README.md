# Rulesets (Engineering)

Engineering's source for the repository's rulesets: one JSON file per ruleset (GitHub's import format) and one table of controls (`controls.md`). Set 1 is minimal (release/C35): `20 - integrating`, `23 - collecting`, `21 - hotfixing`, `22 - wiring`, `30 - promoting` and `40 - publishing` (each named by its stage number, release/C106; the file names stay), each carrying only its `verify Stages` check (publishing one tag rule; `integrating` also requires `verify Stages (Developing)`, release/C37). The source lands on `main` first and is tested there; installing it into the live repository is a separate step done by the Owner (and later by WIRE). Nothing here creates, changes or retires a live ruleset. See `../../../00-changes/C35-stages/change.md`; release/C34 (`../../../00-changes/C34-ruleset-set-1/`) first put set 1 on `main` and is corrected by C35.

The judge and the stage declaration are in `../../stages/` (`stages.json`, `judge.mjs`).
