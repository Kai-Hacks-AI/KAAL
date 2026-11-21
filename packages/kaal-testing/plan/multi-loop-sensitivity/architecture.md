# Multi-Loop Testing and Sensitivity: Architecture

Each element names, in brackets, the Requirements it answers.

- **testing/A53** [testing/F156, testing/F157, testing/N35]: **One updated section in the existing Skill; zero new shipped files.**
  - `skills/kaal-testing/SKILL.md` keeps its section order, replacing `## The three loops` with `## Testing loops` between `## Assessing a test against its claim` and `## Running acceptance`.
  - Because `packages/kaal-testing/test/plan/testability/T156.test.mjs` and `T160.test.mjs` pin the exact heading name `The three loops`, `testing/C72` (DO) updates that pinned heading name in `T156.test.mjs` and `T160.test.mjs` (following the precedent of `testing/C68` updating `T160.test.mjs` when adding `Expected failures` in `#2117`). `testing/C71` (PLAN) touches neither `SKILL.md` nor `T156`/`T160`.
  - **Consumer-agnostic boundary & ownership:** The Skill defines loop boundaries, tracing (`claim -> Case -> sensitivity check -> finding`), and output expectations abstractly (stdout summary + structured report, or a caller-chosen path — never a hardcoded repository path). Testing reports a surviving mutant as a calibrated finding (`potential defect`) naming its owning claim; where Defect state is held and how Defect, Review, and Architecture route work belong to those capabilities, not Testing.
  - **One-off mutation trial vs. lasting contract Cases:** The 15-mutant pilot run on `packages/kaal-testing/lib/contracts.mjs` (3 killed, 12 survived in `evidence.md`) is Change evidence, not a permanent Case in `npm test`. In `testing/C73`, that one-off trial drives adding ordinary, durable `.test.mjs` Cases beside `test/contracts.test.mjs` to pin each surviving contract invariant (or recording explicit judgments for any equivalent mutant). Whether a reusable `skills/kaal-testing/scripts/` runner is earned is an explicit retrospective judgment after `testing/C73`.

## PDCA -> Collector -> `main` Sequence

All Changes land on the dedicated collector `kaal/testing/multi-loop-sensitivity` (established from `main`) via squash PRs, and promote to `main` via one squash PR:

| PR / Change | PDCA Role | Scope | Depends on |
| --- | --- | --- | --- |
| `testing/C71` (this Change) | **Plan** | `plan/multi-loop-sensitivity/` and deterministic RED Cases `T381`–`T383` in `test/plan/multi-loop-sensitivity/` | none |
| `testing/C72` | **Do (Skill + Trial)** | Update `skills/kaal-testing/SKILL.md`, update heading pin in `T156.test.mjs` and `T160.test.mjs`, execute & record judged Skill trial, promote `T381`–`T383` to `.test.mjs` | `testing/C71` |
| `testing/C73` | **Do / Check (Pilot)** | One-off mutation trial on `lib/contracts.mjs`; add durable `.test.mjs` Cases beside `test/contracts.test.mjs` for surviving invariants; record trial findings & BASS judgment | `testing/C72` |
| Sync (if `main` advances) | — | Pure merge commit from `main` into collector | as needed |
| Promotion (`kaal/testing/multi-loop-sensitivity -> main`) | **Act / Promote** | Promote verified collector to `main` and delete collector | `testing/C73` |

## Explicitly Deferred (Follow-up Change)

- Wiring any extracted `kaal-testing` sensitivity/mutation script into `engineering/` (while developing toward deployment) or into `.kaal/` / `.kaal/config/guard/` (once published on npmjs).
- Updating `packages/kaal-testing/README.md` or package `description` if desired after `testing/C73` completes.
