# C2 change

Kai (CPO) said that research is also meant to give someone with a new setup the protocol to check or challenge a result, that more than one technique may be in play, and that this levels up the research game over time. His own automated runs through Antigravity across Claude, Codex and Antigravity are one such technique. He asked for a first step on a longer journey: small.

## The answer in six lines

1. Every record gets a `harness` and a `Protocol` of five stated lines (materials, run, score, confirms, refutes); the materials include the prompt and are evidence entries (F5).
2. A record may `challenges:` another, and then states an `outcome` (replicates, differs, inconclusive) and what differs; the finder lists what each record challenges (F6).
3. A record names `technique: <name>@<n>`; versions are whole numbers, and a record is read against the version it names (F7).
4. Techniques live in the Skill as files in `references/techniques/`, each with its version; the DO ships `judged-trial` at version 1 and nothing else (A2).
5. The judgement stays form only. It does not follow the protocol, look up the challenged record, or look up the technique.
6. The Cases are ordinary `.test.mjs` from the PLAN, RED by assertion on the collector, GREEN in the DO with no renaming.

## Choices made, for review

- **Techniques inside the Skill, not the capability package.** The Skill is what a consumer holds, so a consumer without KAAL can still run and challenge a trial. Kai's go covered the proposal with this recommendation; flagged for review.
- **Required, not optional.** `harness`, `Protocol` and `technique` are required of every new record, because a record a reader cannot rerun is the gap. This makes the C1 example and RH1 malformed until the DO updates them; T1383 (which judges the example) is the ratchet that catches an un-updated example.
- **`outcome` is the challenger's own statement** about the rerun, not a verdict on the original; the original record is not edited by a challenge.
- **Harness names are free text.** Antigravity, Claude and Codex are examples a record may state, not names the judgement knows.
- **The judge who writes the key.** The Skill's technique file says the key's author and the judge should run in different setups; this is guidance, not a form rule.

## What this does not do

No second technique, no parallel-run harness, no runner, no lookup of challenged records or techniques, no rule that a decision must cite a challenge, no ratchet trial (controls owns it and applies this method), no migration of trials other than RH1.

## PLAN

1. Add Intent I2, Requirements F5 to F7, Architecture A2, gap G2, and Cases T1426 to T1428 as `.test.mjs` beside their Requirements; extend `fixture.mjs` so the shared record has a technique, a harness and a protocol.
2. Observe the RED against the collector, and show that each Case can pass and fail for the right reason (`evidence.md`).
3. `draft/` holds the changed scripts used for that, for review only.

## Ids

Proposed: research/C2, I2, F5 to F7, A2, G2, T1426 to T1428. T1425 is the highest Case on main at the time of writing; other open PRs may hold higher ones. The allocator confirms.

## DO

Not authorized by this PLAN. After approval: move the draft changes into the scripts, update `SKILL.md` and `references/rehearsal.md`, add `references/techniques/judged-trial.md`, update the example and RH1 (harness, technique and a protocol added after the fact, said so), and run a rehearsal of whether an agent given the Skill writes a protocol a second agent can follow. The Cases are not renamed.

## Questions for review

1. Is a required protocol of five lines the right weight, or is anything in it needless?
2. Is `differs-in` free text enough for now, or should it be a fixed list?
3. Ids are proposed: the allocator confirms.

## ACT

The retro of the collector that carries this Change, in kaal-retro's contract.
