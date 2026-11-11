# C4 change

## PLAN

1. Add I3, F4, F5, F6 and A17 to A23 with their Cases T55 to T65, and C4 with its own Cases T66 to T71, one per gap.
2. Observe the expected RED against `main` (`evidence.md`).
3. Inventory the control across hooks, workflows and rulesets, and observe where it is declared, where it executes and where it prevents integration (`inventory.md`).
4. Assess each realization with MERIT and say what is terminated, which is nothing in this PLAN (`merit.md`).
5. Define the sequence, the equivalence tests, the fallback and the acceptance and retirement criteria (`transition.md`).
6. The PLAN moves nothing, changes no workflow, hook or declaration, and does not touch a ruleset or a branch protection. It cites no document that is not on `main`.

## DO

Not authorized by this PLAN. The sequence S1 to S6 of `transition.md` is the proposal, each step its own Change and each reviewed before the next.

## ACT

1. Record what the migration showed about inventorying, placing, separating and proving a control, and what the next MERIT migration should reuse.

## Dependencies

The common metamodel owns the relationship vocabulary, Testing owns Case design, identity, placement and expected-RED execution, and the common control contract owns the verdicts PASS, FAIL and UNKNOWN. Change Isolation consumes them. This Change does not define them, does not move them and does not duplicate them. The preventive requirement that a verdict is a condition of admission belongs to `guard Integration`, and this Change does not touch a ruleset.
