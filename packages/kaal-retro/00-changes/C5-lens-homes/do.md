# C5 DO

Built from the merged PLAN (#2158), on the collector `kaal/retro/agent-seat-4l` after the DO of C4 and the SYNC with main.

- `references/4l.md` is rewritten in the first person: each lens opens with its own question (what did I rely on, what did I find outside, what was missing when I had to decide and what did it cost, what would I like that I never needed), then the line between Lacked and Longed For in both directions (what did I do differently because of the absence), the paragraph on echo and mirror, and the result shape with the mandatory `Account of:` line.
- `SKILL.md` points to echo and mirror in one line and asks for the first `Account of:` line in my own words (489 words).
- `judge-retro.mjs` has the rule `account-of`: the first line after the front matter begins `Account of:` followed by text that is not empty. It never reads the text.
- The fixtures of T1250 to T1254 carry the line; T1255 is renamed from `.red.mjs` to `.test.mjs`. The package runs 6 Cases and all pass.

## Evidence

- Agent trial for F5, two fresh agents, each given only the Skill and its reference and a replayed correction that plants: a missing rule that is a real blocker, a finder that exists but is not pointed to (easy to put under Liked and Lacked both), a dashboard never needed, a merge conflict that could have happened and did not, and per-capability folders that helped and cost nothing. Both retros are `well-formed`, and in both the planted points are in one lens each: the queue rules and the unrouted finder in Lacked only (no Liked entry for the finder), the dashboard and the unhit conflict in Longed For with a true `worked-anyway` line, the helpful folders in Liked. Neither Learned says what to do here; each states what its source says, secondhand where only search summaries were read. Each retro opens with an `Account of:` line naming the thread and its role in its own words.
- Before the text, in the C4 trial, one run of one agent mirrored the finder under Liked and Lacked. Here that did not recur in two runs.
- What the trials did not show: two runs on a replay, read by me, not a live correction and not by an independent reader. Both agents guessed the address of the unrouted finder (the Skill or AGENTS.md); the text does not settle it, and says only that two Lacked may share an address. One said the folder `02-learnings/retros/` was unclear when given a scratch path.
- Nothing was published, installed or added to the workspaces.
