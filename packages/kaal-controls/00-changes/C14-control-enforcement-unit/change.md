# C14 change

## PLAN

1. Add the gap G91, the Intent I8, the Requirements F25, F26, N9 and F27, the Architecture A12 and A13, and the interface (`interface.md`), with the Cases T920 to T928 (T929 to T931 stay reserved). The Cases are `T<n>.red.mjs`.
2. Observe the expected RED against the C12 collector (`evidence.md`), and that each Case can pass against a throwaway implementation.
3. State the route to `main` and the steps that are Kai's (`promotion.md`).
4. The PLAN adds no script, no workflow, no App, no ruleset and no secret.

## DO

Not authorized by this PLAN. On the merge of this PLAN into the collector, which is the go for the DO:

1. The finder reads `stations`; add `registry.mjs`, `judge.mjs`, `sign.mjs`, `enforcement/workflow.yml` and `enforcement/app-manifest.json`; add `enforcement` to `files`.
2. Add `references/enforcing-controls.md` (when a control should be preventive at a station, what a lack of a signed run means, who may sign); add the pointer in `SKILL.md` within the 600 words, and the line in `judging-status.md` that Running at a station needs a signed check.
3. Add `engineering/controls/stations.json` and rename the Cases from `T<n>.red.mjs` to `T<n>.test.mjs` when green.
4. No second control, no hook for Developing and no ruleset change in this Change.

## ACT

A 4L retrospective of the Change, delivered to `main`.

## Left open

- The Developing station (the pre-push hook) runs the same controls unsigned and advisory. It is another Change.
- A registry of more than one station and the lack-of-control judgment (an Intent no control has) come when a second control needs them.
- Whether release/CTL8 is `running` or `tested` is judged by its owner with the CPO, on a signed run and on a refusal.
