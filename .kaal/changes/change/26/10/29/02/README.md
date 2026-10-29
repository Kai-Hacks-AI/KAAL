# change/C4 PLAN: the kaal-change 0.0.1 release

Capability: `kaal-change`. Collector: `kaal/change`.

## Why

The Owner asked on #530 (comment 6502453602) for a release path to `kaal-change` 0.0.1, at the quality of `@kaihacksai/kaal-guard`:
- shipped documentation;
- tests a consumer runs inside the installed package;
- honest evidence, consumer versus publisher-only, with no GREEN on zero tests;
- acceptance on the packed artifact in a clean consumer.

Change 0.0.1 is one of the Owner's five delivery objectives (2026-10-29).

## How

This is a PLAN Change. It ships no code.

- `packages/skills/kaal-change/plan/release/`: the Intent (change/I11–I15), the Requirements (change/N6–N7, change/F18–F26), the Architecture (change/A11–A16) and the Testing plan.
- `packages/skills/kaal-change/test/plan/release.test.mjs`: change/T24–change/T29, RED.

It proposes these Owner decisions:
- the package is `@kaihacksai/kaal-change`;
- Graph is an optional peer, needed only for delivery, and without it delivery cannot assess.

## Owner review 5705681738

Verifying the installed package is distinct from assessing a Change's delivery (`change/F23`).
- **Without Graph.** The documented `cannot-assess` result is a passing consumer test of the optional-complement contract. The installation verifies over what applies to it, and the Graph cases are listed as not applicable.
- **With Graph.** The full delivery path must verify.
- **What stays honest.** A failing case is failed. An applicable case that did not run, a changed file or a missing manifest is unknown.

change/T28 and change/F25 cover each scenario, and the exclusion option is gone.

## Not authorized here

No DO, synchronization, promotion, version change or publication.
