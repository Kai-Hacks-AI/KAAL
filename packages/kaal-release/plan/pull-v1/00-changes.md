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

## ACT: retrospective (4L)

Written by the agent that carried the Change.

### Liked

- Starting from the CPO's three steps and writing five RED Cases first made the DO small: a ~60-line walker went green on T19 to T23 without a rewrite.
- Reading the recorded real collector (T23) again gave the reduced Script a true answer: it does not qualify, and it names the PLAN and ACT of release/C14 as missing.
- The review found two real holes by reading the code against the spec, not by tests: an open piece silently dropped, and an empty declaration that qualifies everything. Both became Cases that fail on the earlier head.

### Learned

- "Absent" and "empty" are different failures of a declaration, and both must read as not judged: a vacuous set makes `every` true. Any rule written as "all of these are fine" needs a Case for the empty set.
- Filtering by state before grouping lets a state vanish from the evidence. Group first, then judge each state, so outstanding work stays visible.
- A reduction PLAN should name the Cases of the old Change that retire, up front. I listed them in the DO (`retired.md`), which worked, but the PLAN could have carried it.
- The first Branching run on a new PR fails until auto-merge registers; the re-run passes. Not a defect of the Change.

### Lacked

- A producer for the facts. The Script only reads files, so nobody can run it on the real repository yet; the C5 thread asked and the answer was "by hand".
- A shared Release declaration: v1 will carry its own `declaration.json`, which can drift from what Show WIP knows about the collectors.
- Evidence of a qualifying collector. Every recorded real collector so far does not qualify; the green path is only tested on fixtures.

### Longed For

- `pull/C2`, the read-only command, so the answer to "which collector qualifies?" is a command and not a reading of GitHub by hand.
- One declaration of the ordered collectors that Show WIP and Pull Promotion both read, without either depending on the other's output.
- A real collector that qualifies, to prove the green path on the host and not only on fixtures.
