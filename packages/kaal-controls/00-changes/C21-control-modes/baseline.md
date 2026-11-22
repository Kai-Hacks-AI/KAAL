# C21 baseline

Observed on `main` (41253d8a):

- A control with `stations: [Integrating:advisory]` or `[Integrating:ratchet]` is refused: `stations is not a list of <Station>:<mode>`.
- `scripts/` holds `check-controls.mjs`, `evidence.mjs`, `find-controls.mjs` and `registry.mjs`; none takes a check's answer and a mode and says whether the answer blocks.
- `package.json` ships `skills` only, and the package has no `AGENTS.md`.
- `SKILL.md` has 599 words, the limit being 600. The DO shortens existing words to make room for one pointer line.
- controls/T591 asserts that `files` in `package.json` is exactly `['skills']`.
