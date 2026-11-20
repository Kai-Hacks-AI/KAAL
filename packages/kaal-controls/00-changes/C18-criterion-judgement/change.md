# C18 change

## PLAN

1. Add the gap G95, the Intent I12, the Requirement F31 and the Architecture A17, with the draft in `interface.md`, and the Cases T1098 to T1101 as `T<n>.red.mjs`.
2. Observe the expected RED against `main` and the same Cases GREEN against a throwaway copy (`evidence.md`).
3. State the route to `main` (`promotion.md`).
4. The PLAN adds no script, control or workflow and touches only `packages/kaal-controls/` documents and Cases.

## DO

Not authorized by this PLAN. On the merge of this PLAN into the collector, which is the go for the DO:

1. Add the `without` and `shows` rules, `readJudgements`, `digestOf` and `judgementOf` to `evidence.mjs`, make `readRecords` skip judgement files, add the reference `judging-criterion.md` and one pointer line to `SKILL.md`, show the judgement in the state line, rename the Cases to `T<n>.test.mjs`. The package keeps its Cases green and `SKILL.md` stays within 600 words.
2. The state line is C16's, which is not yet on `main`. The DO therefore starts after the C16 promotion lands and the collector has synchronized with `main`.

## ACT

1. A 4L retrospective of the Change, delivered to `main`.

## Left open

- A directive cannot be broken in a way that is caught, so it cannot meet the rule that one declared kind is `:fail`. Whether a directive may declare a minimum without one is Kai's to decide; this Change asks nothing more of a directive.
- A `:fail` run with no `shows` and a base with no `without` still count, so nothing already written breaks. They are counted and shown. Making them required is a later, stricter step.
- Whether Tested must require a `covered` judgement is not decided here. The judgement is shown beside the result and changes no verdict.
- kaal-review already has a record for a review (`review/A1`: `subject.json` and `review.md` with Proven, Judged and Testable marks, whose focus is a promotion or a capability). This Change defines the judgement as a small record that points at a control and does not reshape review's. Whether a judgement should be a review record with the control as its focus is for review and for Kai.
- A script cannot tell who wrote a Case, so that the judge is not its author stays a rule in the reference. The converter of controls/C17 does not yet write `without` or `shows`, and where KAAL keeps its judgements is for Engineering.
