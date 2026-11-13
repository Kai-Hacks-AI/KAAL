# Pull Promotion v1 capability: Change (A to B)

This is `pull/C3`, a PLAN Change. It ships no code. It reduces the `pull-promotion.mjs` Script of `pull/C1` ([../pull/00-changes.md](../pull/00-changes.md), kept untouched as the record of what shipped) to the smallest useful capability. The path is agreed with the CPO (12 Nov 2026) in [../pull-integration/v1.md](../pull-integration/v1.md).

## A: the present

`pull/C1` judges one named collector through six judgments (lifecycle, verification, protection, sequencing, validation, attribution), a gap-relevance rule, holds and a next-step vocabulary, and it reads Analyze Flow's findings. It does not walk the collectors, and it overreaches: parts of it re-judge what the preventive controls and the Owner own.

## B: the target

The Script exports `walkCollectors(facts, declaration)` and prints the same from a command line (`node pull-promotion.mjs <facts.json> <declaration.json>`). It does three things:

1. walks the collectors the declaration lists, in the declared order;
2. says for each whether it has fulfilled its PDCA: every Change in it, not yet delivered, has PLAN, DO and ACT landed there and the declared Check checks are green on its head, naming what is missing and treating an unreadable fact as not judged;
3. lists the qualifiers in the declared order and names the first as the one that moves next, or says why none qualifies.

It is advisory: it never says ready, never authorizes a promotion, judges neither CI nor branch readiness, reads no review and nothing of Show WIP. See [requirements.md](requirements.md) and [testing.md](testing.md).

## Order and constraints

First of the two Changes of v1, before the command `pull/C2`. Its own PLAN, DO and ACT in its own collector, borrowing no other Change's evidence. In its DO it removes the judgments, rules and Cases of `pull/C1` that this target drops (validation, attribution, sequencing, holds, gap relevance, next-step vocabulary, the use of Analyze Flow's findings); the DO states the list. No hook, CI, ruleset or Guard change; no host access.

## Not in this Change

The command and the host gatherer (`pull/C2`); the shared observation elements, a shared Release declaration, gap classification, stronger read-only proof and wiring (deferred, [../pull-integration/v1.md](../pull-integration/v1.md) section 4).
