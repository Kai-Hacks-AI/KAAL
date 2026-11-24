# Judged Skill Trial Protocol (`testing/C72`)

- **Subject:** `trial/subject/` (`budget-gate`), synthetic module independent of `lib/contracts.mjs` and the `testing/C73` pilot.
- **Prompt:** `trial/prompt.common.txt` — identical across both arms; embeds the five planted evidence needs without naming or hinting at any of them.
- **Frozen key:** `trial/key.json` — authored and committed on `testing/c72-do` **before** editing `packages/kaal-testing/skills/kaal-testing/SKILL.md`.
- **Arms & runs:**
  - `baseline` arm (`n = 2` fresh `research` subagent sessions): receives `origin/main` `SKILL.md` (`69025fca`) + `references/findings.md` + `prompt.common.txt`.
  - `skill` arm (`n = 2` fresh `research` subagent sessions): receives updated `testing/C72` `SKILL.md` + `references/findings.md` + `prompt.common.txt`.
  - All 4 sessions have identical permissions (`research` read-only subagent), zero prior conversation context, and instructions to answer strictly from the provided prompt without calling tools or reading repository files (preventing cross-arm contamination or reading `key.json`).
- **Verified Skill loading:** Every session begins by listing the exact `name`, `#` title, and `## ` section headings of the `SKILL.md` it received, verified against the hashed prompt stored in `trial/do/manifest.json` (`@kaihacksai/kaal-foundation/sha256`).
- **Separate judging session:** A 5th fresh `research` subagent receives `trial/key.json` and the 4 raw, unedited transcripts (`trial/do/run{1,2}/{baseline,skill}.raw.txt`), verifies verbatim quotes present in each transcript (programmatically re-checked before saving), and writes a reasoned judgment (`trial/do/judgment.md`) — never a mechanical 5-of-5 score.
