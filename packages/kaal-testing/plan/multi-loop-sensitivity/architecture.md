# Multi-Loop Testing and Sensitivity: Architecture

Each element names, in brackets, the Requirements it answers.

- **testing/A52** [testing/F152, testing/F153, testing/F154, testing/N34]: **One updated section in the existing Skill; zero new files shipped.**
  - `skills/kaal-testing/SKILL.md` keeps its exact section order, replacing `## The three loops` with `## Testing loops` between `## Assessing a test against its claim` and `## Running acceptance`.
  - Because `packages/kaal-testing/test/plan/testability/T156.test.mjs` and `T160.test.mjs` pin the exact heading name `The three loops`, `testing/C70` (DO) updates that pinned heading name in `T156.test.mjs` and `T160.test.mjs` (following the precedent of `testing/C68` updating `T160.test.mjs` when adding `Expected failures` in `#2117`). `testing/C69` (PLAN) touches neither `SKILL.md` nor `T156`/`T160`.
  - **Consumer-agnostic boundary & result placement:** The Skill defines loop boundaries, tracing (`claim -> Case -> inert-stub RED / mutant -> outcome -> finding`), and output expectations abstractly (stdout summary + structured report, or a caller-chosen path — never a hardcoded repository path). Durable pilot findings go into the Change's record, not into `skills/kaal-testing/`.
  - **BASS separation:** `testing/C70` updates the Skill first; `testing/C71` executes the landed Skill on `lib/contracts.mjs` via an ephemeral/test-time Node 24 `module.registerHooks` check and strengthens `test/contracts.test.mjs`. Whether a reusable `skills/kaal-testing/scripts/` runner is earned is an explicit retrospective judgment after `testing/C71`.

## PDCA -> Collector -> `main` Sequence

All Changes land on the dedicated collector `kaal/testing/multi-loop-sensitivity` (established from `main`) via squash PRs, and promote to `main` via one squash PR:

| PR / Change | PDCA Role | Scope | Depends on |
| --- | --- | --- | --- |
| `testing/C69` (this Change) | **Plan** | `plan/multi-loop-sensitivity/` and `test/plan/multi-loop-sensitivity/*.red.mjs` | none |
| `testing/C70` | **Do (Skill)** | Update `skills/kaal-testing/SKILL.md`, update heading pin in `T156.test.mjs` and `T160.test.mjs`, promote `T378`–`T380` to `.test.mjs` | `testing/C69` |
| `testing/C71` | **Do / Check (Pilot)** | Apply landed Skill to `lib/contracts.mjs`, close surviving mutants in `test/contracts.test.mjs`, promote `T381` to `.test.mjs`, record BASS judgment | `testing/C70` |
| Sync (if `main` advances) | — | Pure merge commit from `main` into collector | as needed |
| Promotion (`kaal/testing/multi-loop-sensitivity -> main`) | **Act / Promote** | Promote verified collector to `main` and delete collector | `testing/C71` |

## Explicitly Deferred (Follow-up Change)

- Wiring any extracted `kaal-testing` sensitivity/mutation script into `engineering/` (while developing toward deployment) or into `.kaal/` / `.kaal/config/guard/` (once published on npmjs).
- Updating `packages/kaal-testing/README.md` or package `description` if desired after the pilot validates the wording.
