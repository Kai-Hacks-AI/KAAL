# C4 change

## PLAN

1. Add the gap G1, the Intent I1, the Requirements F1 to F4 and N1 and the Architecture A1, and the Cases T1250 to T1254 (`T<n>.red.mjs`).
2. Observe the Cases RED against `main` and GREEN against a throwaway copy (`evidence.md`).
3. State the route to `main` (`promotion.md`).
4. The PLAN adds no script, no Skill, no package file and no workflow, and touches only `packages/kaal-retro/` documents and Cases. F4 (the Skill's agent seat) has no Case: it is judged in the DO by an agent trial.

## DO

Not authorized by this PLAN. On the merge of this PLAN into the collector, which is the go for the DO:

1. Add the package (`package.json`, `README.md`, `LICENSE`, `ownership.kaal.json`) and the Skill `skills/kaal-retro/` with `SKILL.md`, `references/4l.md`, `scripts/find-retros.mjs` and `scripts/judge-retro.mjs`, taking the content of the closed `kaal/retro/skill` where it fits and rewriting it from the agent's seat.
2. Rename the Cases from `T<n>.red.mjs` to `T<n>.test.mjs` when they are green.
3. Run the agent trial for F4: a fresh agent, given a consumer that routes "looking back on your own work" to the Skill by its description, writes a retro of a replayed real correction. The result is the judgement `well-formed` and a Lacked decision point that matches the recorded correction. The trial and its limits go in the DO's evidence.

## ACT

1. A 4L retrospective of the collector, written with the Skill, as the first retro in `retro/02-learnings/retros/`.

## Left open

- Outside Retro and not in this Change: how a consumer routes to the Skill (its AGENTS.md line), what a Change's PR template says about a retro, and when a process counts a collector as closed. Each is the consumer's or its owner's own Change.
- Cases T1250 to T1254 take ids that other collectors in flight may also take; the DO checks for a clash before the rename.
- The Skill is not installed or registered anywhere by this Change.
