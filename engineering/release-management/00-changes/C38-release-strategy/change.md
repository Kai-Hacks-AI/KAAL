# C38 change

## PLAN

1. **From.** `05-src/stages/stages.json` describes the stages as configured, and `verify Stages` judges each stage against it. Nothing above it states the chain, the order, who challenges whom, or what is a gap or an overlap.
2. **To.** `engineering/release-management/strategy.md`, small and focused: the chain Developing, Integrating (Collecting, Hotfixing, Wiring), Promoting, Publishing and then npmjs; the challenge model with its three cross-stage challenges and their direction; IN, STOCK and OUT; priority and flow; and one fenced `chain` block that a test can read. The draft is in `interface.md`.
3. **Because.** Owner direction (16 Nov 2026): one strategy file at the root, kept small, improved later. It must be on `main` before the controls work starts.
4. Two Cases, both RED on `main`:
   - T520: `strategy.md` exists at the root, equals the draft in `interface.md`, has the four chapters and a `chain` block, stays under 80 lines, and names no GitHub setting (no ruleset, check or branch-protection detail).
   - T521: the `chain` block agrees with `stages.json`: the same stages in the same order, the same parts of Integrating, and exactly three challenges with their direction: Integrating > Developing (backward), Promoting > Integrating (backward) and Promoting > Publishing (forward). The strategy keeps readiness apart from proof that a publication occurred.
5. Not in this Change: any change to `stages.json`, `judge.mjs` or a workflow; making `verify Stages` read the strategy (a later Change, with its own RED Cases); the controls register; a Core Node type; the link to release/C36's declaration; version bumps and publication.

## Ids

C38 and T520 to T521 come from the coordinator's allocation (T520 to T529). The Change adds no Intent, Requirement, Architecture or gap id, because it adds no new product behaviour: it is a reference document with a consistency test. If the Owner wants those, the coordinator allocates them.

## DO

`strategy.md` at the root of `engineering/release-management`, equal to the draft. T520 and T521 are renamed to `.test.mjs` when green.

## ACT

A 4L retrospective in `act.md` before the promotion.

No workflow, ruleset, control or publishing change is authorized by this PLAN.
