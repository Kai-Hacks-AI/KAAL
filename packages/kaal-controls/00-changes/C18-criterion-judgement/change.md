# C18 change

## PLAN

1. Add the gap G95, the Intent I12, the Requirement F31 and the Architecture A17, with the draft in `interface.md`, and the Cases T1098 to T1101 as `T<n>.red.mjs`.
2. Observe the expected RED against `main` and the same Cases GREEN against a throwaway copy (`evidence.md`).
3. State the route to `main` (`promotion.md`).
4. The PLAN adds no script, control or workflow and touches only `packages/kaal-controls/` documents and Cases.

## DO

Not authorized by this PLAN. On the merge of this PLAN into the collector, which is the go for the DO:

1. Add the `without` and `shows` rules (a `:fail` run without them is listed as `incomplete` and never counted), `readSubjects` and `reviewsOf` to `evidence.mjs`, add the reference `judging-criterion.md` and one pointer line to `SKILL.md`, show the reviews of the control in the state line, rename the Cases to `T<n>.test.mjs`. The three Cases of controls/C15 that build provoked records (T1087, T1088, T1089) fail under the stricter rule, as observed against the throwaway: the DO gives their `:fail` records a `without` and a `shows` and their control a preventive station, and their assertions stay. The package then keeps its 47 Cases green and `SKILL.md` stays within 600 words.
2. The state line is C16's, which is not yet on `main`. The DO therefore starts after the C16 promotion lands and the collector has synchronized with `main`.

## ACT

1. A 4L retrospective of the Change, delivered to `main`.

## Left open

- A directive cannot be broken in a way that is caught, so it cannot meet the rule that one declared kind is `:fail`. Whether a directive may declare a minimum without one is Kai's to decide; this Change asks nothing more of a directive.
- No control has recorded runs yet, so the stricter rule breaks no claim. The converter of controls/C17 does not yet write `without` or `shows`, so records it writes show as `incomplete` until Engineering changes it, in its own Change.
- Review coverage is not the review's finding. Whether Tested must require a review of complete coverage, and how a review's finding enters a report, is not decided here. A review is shown beside the result and changes no verdict.
- The record is kaal-review's. This Change needs one thing from review: that `subject.json` may carry `subject`, the id of the element reviewed, and that a review of a control is `focus: control` with its own reference and actual, which review's record already allows. Review owns it and its Cases, and the DO waits for that.
- A review shows no staleness here. Whether the control or its Cases changed after the review is read from Git by whoever reports, and is not part of this Change.
- A script cannot tell who wrote a Case, so that the reviewer is not its author stays a rule in the reference. Where KAAL keeps its reviews of controls is for Engineering.
