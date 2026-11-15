# Reject-a-Case Enforcement: Evidence

## RED of this PLAN

Baseline: `main` at `888ce0f`. `node packages/kaal-testing/test/plan/rejects-case/run-red.mjs`, Node 22, Linux: T360 to T362 are RED-observed, 0 error, 0 green. Each fails with `missing: plan/rejects-case/trial/do (the DO trial records)`, because the trial does not exist yet.

**Can each Case pass, and fail for the right reason.** Against a throwaway reference outside the repository (synthetic trial records for four claims, two of them Cases, two runs per arm, and a Case file copied from another capability), all three were GREEN. Four mutants were each caught by the Case that owns them: a Case claim answered with `rejectsCase` null (T360), a value on a claim that is no Case (T360), a difference marked resolved (T362), and a difference left out of the comparison (T362). The reference is not part of this PLAN, and the answers in it say nothing about what an agent would answer.

## What this PLAN does not claim

It does not show that the Skill makes an agent reject the right Case. It makes the answer to a Case claim a stated answer, so that the trial can read it. Which Case the DO trial uses as its real Case is chosen by the DO from the repository, and its owner's key is not touched.
