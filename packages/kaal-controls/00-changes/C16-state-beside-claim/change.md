# C16 change

## PLAN

1. Add the gap G93, the Intent I10, the Requirement F29 and the Architecture A15, with the draft in `interface.md`, and the Cases T1091 to T1093 as `T<n>.red.mjs`.
2. Observe the expected RED against `main` and the same Cases GREEN against a throwaway copy (`evidence.md`).
3. State the route to `main` (`promotion.md`).
4. The PLAN adds no script, control or workflow and touches only `packages/kaal-controls/` documents and Cases.

## DO

Not authorized by this PLAN. On the merge of this PLAN into the collector, which is the go for the DO:

1. Add `computedState` and `stateLine` to `evidence.mjs`, change its command as in `interface.md`, add the reference text, rename the Cases to `T<n>.test.mjs`. The package keeps its 47 Cases green and `SKILL.md` stays within 600 words.

## ACT

1. A 4L retrospective of the Change, delivered to `main`.

## Left open

- The command's default output changes from JSON for tested claims to lines for every control with a minimum; `--json` keeps the verdicts. Nothing in the repository reads the old output.
- Implemented and running are not computed; they need observations, which belong to Engineering and to the records the Skill is given.
