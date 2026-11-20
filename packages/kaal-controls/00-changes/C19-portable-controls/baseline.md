# C19 baseline

Observed on `main` at the head of the collector:

- A control with `intent: <words>` and no `has` is refused (`has is missing`, `intent is not a field of a control`).
- A control with `stations: [Reviewing:detective]` is refused (`stations is not a list of <Station>:<mode>`), and the registry lists it at no station.
- `findControls(files)` takes no links: a Case counts as testing a control only when its file's first line says so, and `findControls(files, links)` ignores `links`.
- The Skill's references are `declaring-controls.md`, `enforcing-controls.md` and `judging-status.md`; none helps find a control that is not yet declared and none says what to seek from another capability.
- `SKILL.md` has 599 words, the limit being 600.
- `stateLine` prints the id, then `claimed`, `computed` and the progress: no title and no type.
