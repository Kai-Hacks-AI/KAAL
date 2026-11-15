# Case Ownership: Evidence

## RED of this PLAN

Baseline: `main` at `888ce0f`. `node packages/kaal-testing/test/plan/case-ownership/run-red.mjs`, Node 22, Linux: T360 to T362 are RED-observed, 0 error, 0 green. Each fails with `missing: plan/case-ownership/survey/survey.json (the DO survey)`, because the survey does not exist yet.

**Can each Case pass, and fail for the right reason.** Against a throwaway reference outside the repository (a survey of the scope `packages/kaal-testing` and `packages/kaal-controls` produced by the helper, one judgment for each owned node by the owner read from its id, and one investigation for each unresolved Case), all three were GREEN. Six mutants were each caught by the Case that owns them: a judge that is not the owning concern (T361), a judgment naming a Case the survey does not link (T361), a Case marked rejected (T360), a missing investigation (T362), an outcome outside the four (T362), and a Case file edited after the survey (T360, T362). The reference holds placeholder verdicts and reasoning. It is not part of this PLAN, and it says nothing about whether any Case is adequate.

**What the mechanic finds on main.** Run on the scope `packages/kaal-testing` and `packages/kaal-controls` at `888ce0f`, the helper lists 19 Case files, 4 of them unresolved. The ones read were Controls' T16 to T18, which declare `controls/G1` to `controls/G3` while no document in the scope defines those ids. Whether a node is missing, a link is wrong, or an existing node should own them is not decided here. It is the investigation `testing/C62` records, by judgment, with the Controls owner. This is a count by a deterministic helper, not a defect finding.

## What this PLAN does not claim

It does not judge any Case, any owner or any key. It does not show that every Case in the repository is owned, and it does not decide who owns an unresolved Case. The scope of the DO survey is chosen by the DO from the repository and recorded in `survey.json`. The earlier `rejectsCase` signal, where a trial still uses it, is not touched.
