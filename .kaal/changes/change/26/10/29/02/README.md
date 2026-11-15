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

- `packages/skills/kaal-change/plan/release/`: the Intent (change/I11–I15), the Requirements (change/N6–N7, change/F18–F26, change/F29–F32), the Architecture (change/A11–A16) and the Testing plan.
- `packages/skills/kaal-change/test/plan/release.test.mjs`: change/T24–change/T29 and change/T33–change/T35, RED.

It proposes these Owner decisions:
- the package is `@kaihacksai/kaal-change`;
- Graph is an optional peer, needed only for delivery, and without it delivery cannot assess.

## Owner review 5705681738

Verifying the installed package is distinct from assessing a Change's delivery (`change/F23`).
- **Without Graph.** The documented `cannot-assess` result is a passing consumer test of the optional-complement contract. The installation verifies over what applies to it, and the Graph cases are listed as not applicable.
- **With Graph.** The full delivery path must verify.
- **What stays honest.** A failing case is failed. An applicable case that did not run, a changed file or a missing manifest is unknown.

change/T28 and change/F25 cover each scenario, and the exclusion option is gone.

## Owner follow-up 6517590098

`cannot-assess` is a diagnostic a consumer can act on (`change/F29`).
- It names `@kaihacksai/kaal-graph`, and offers exactly two next steps: install or enable Graph and assess again, or analyze the Bare content with an agent's or a person's help.
- It is never a failed delivery. `assess` installs nothing and writes nothing.
- Testing owns the diagnostic form. Change supplies its own case's guidance, as its own finding members until Testing defines a form.

change/T33 is the bounded negative test of the consumer-facing diagnostic.

## Owner review 5717447317

The release aligns with Packaging's generic KAAL Package contract (`packaging/C4`, #658), and restates none of it.
- **change/F30** maps each generic Requirement to the Change Requirement that realizes it. The generic one governs.
- **Operations** moves into `docs/operations.md`, which is authoritative, and the README links it (packaging/F8, change/F21).
- **The declared source Test Plan** is `test:embedded`, `test:publisher` and `test` (packaging/F14, change/A15).
- **Runtime and platforms** are declared (packaging/F12, change/F31).
- **Coverage** is traced in the manifest (packaging/F13, change/F32). Without Graph, a Requirement traced only to Graph cases is reported unresolved, with the peer and the next step.
- **Dual conformance.** Engineering runs Packaging's generic suite and Change's specific acceptance on one candidate (change/A16).

change/T25–change/T27 are revised, and change/T34–change/T35 are added.

## Not authorized here

No DO, synchronization, promotion, version change or publication.
