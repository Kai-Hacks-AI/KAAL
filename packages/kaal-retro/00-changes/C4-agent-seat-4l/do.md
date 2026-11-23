# C4 DO

Built from the merged PLAN (#2152), on the collector `kaal/retro/agent-seat-4l`.

- The package `@kaihacksai/kaal-retro` (`package.json`, `README.md`, `LICENSE`, `test/cases.test.mjs`) and the Skill `skills/kaal-retro/`: `SKILL.md` (445 words, written for the acting agent), `references/4l.md`, `scripts/find-retros.mjs` and `scripts/judge-retro.mjs`, Node built-ins only. Content of the closed `kaal/retro/skill` was rewritten, not merged.
- The Skill tells the agent to write a short note at the moment of a correction (decision point, what it did, what it cost) and to turn those notes into the one retro when the collector lands, so the decision point is not rebuilt later.
- Cases T1250 to T1254 renamed from `.red.mjs` to `.test.mjs`; no clash with another Case id on `main`.
- Not done: `ownership.kaal.json`, which the PLAN listed. It needs a Capability Node for Retro, which this Change does not add; no package without one is refused today (kaal-controls has none). It is left to the Change that registers Retro.

## Evidence

- `npm test` in `packages/kaal-retro`: 5 Cases pass, RED on their own assertions before the DO (`evidence.md`).
- Agent trial for F4, one run: a fresh agent was given only the Skill and its reference and an AGENTS.md line in plain words, plus a replayed real correction (the queue SYNC case and a reused control id), and no other file. It wrote a retro whose judgement is `well-formed`, whose Lacked decision points match the replayed corrections, and whose Learned has two sources, marked secondhand. It found the Skill by its description only.
- What the trial did not show: it was one run and a replay, not a live correction. The agent put an existing finder under Liked while a Lacked entry was about a pointer to the same finder, so one thing sat in two lenses under two subject lines; the form check cannot see that. The Skill now says that thing belongs where it cost something, and that Liked may be `None raised.`. That wording is untested by a second run.
- Nothing was published, installed, deployed or added to the workspaces.
