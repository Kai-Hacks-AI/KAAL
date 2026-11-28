# Guard: solution protection (PLAN)

Capability: Guard. Proposed `guard/C171`; identifiers are provisional.
Collector: kaal/guard/solution-protection. Destination: main through a separate promotion.

## Request

Kai asked that Guard prepare to become solution protection with the `guard.json` interface discussed (`/guard/interface-plan.md` in the project files). The motivating case is eight package suites that run in no required check.

## Change

PLAN of guard/C171 under `packages/kaal-guard/plan/solution-protection/`: I10 to I12, F41 to F48, N14 to N16, A20 to A24 and the Cases T1670 to T1679 as one RED file. No code.

## Verification

Each Case run with `node --test` on Node 24: all ten fail before a behavioural assertion because `plan` and `fold` do not exist.

## Boundary

No DO, no WIRE, no ruleset edit, no registration in other packages, no npm publish, no `change` or `delivery` aggregate.
