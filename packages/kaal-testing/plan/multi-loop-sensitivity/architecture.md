# Multi-Loop Testing and Sensitivity: Architecture

Each element names, in brackets, the Requirements it answers.

- **testing/A53** [testing/F156, testing/F157, testing/N35]: **One updated Skill (`SKILL.md` frontmatter `description` + `## Testing loops`); zero new shipped files.**
  - `skills/kaal-testing/SKILL.md` updates its frontmatter `description` so discovery metadata matches composable loops instead of "three loops", and replaces `## The three loops` with `## Testing loops` between `## Assessing a test against its claim` and `## Running acceptance` while keeping the rest of the section order intact.
  - Because `packages/kaal-testing/test/plan/testability/T156.test.mjs` and `T160.test.mjs` pin the exact heading name `The three loops`, `testing/C72` (DO) updates that pinned heading name in `T156.test.mjs` and `T160.test.mjs` (following the precedent of `testing/C68` updating `T160.test.mjs` in `#2117`). `testing/C71` (PLAN) touches neither `SKILL.md` nor `T156`/`T160`.
  - **Test execution integration (`testing/C72`):** Because `packages/kaal-testing/package.json` `scripts.test` lists test entrypoints explicitly rather than globbing, `testing/C72` promotes `T381`–`T383` from `.red.mjs` to `.test.mjs`, adds the aggregate entrypoint `packages/kaal-testing/test/plan/multi-loop-sensitivity.test.mjs` (matching `testability.test.mjs` and `expected-failures.test.mjs`), appends `test/plan/multi-loop-sensitivity.test.mjs` to `packages/kaal-testing/package.json` `scripts.test`, and verifies in `npm test` that all three Cases execute.
  - **Consumer-agnostic boundary & ownership:** The Skill keeps Concern/Claim and Evidence method/boundary composable, defines tracing and output expectations abstractly (stdout or caller-chosen path, never a hardcoded repository path), and reports surviving mutants as `potential defect` findings naming their owning claims. Testing holds no Defect lifecycle, placement, correction, or closure. (Note: `payload/Testing.md` and `README.md` keep their existing triad wording untouched in this Change; preserving concrete conformance/acceptance/implementation perspectives inside `## Testing loops` avoids contradicting them.)
  - **One-off trial & attributable sensitivity protocol (`testing/C73`):** The 15-mutant baseline run on `packages/kaal-testing/lib/contracts.mjs` (`evidence.md`) is Change evidence only, not a permanent Case or production defect score. In `testing/C73`, any replacement-based sensitivity check must:
    1. confirm the replacement hook actually intercepted the target module;
    2. preserve unrelated valid exports/behaviours when challenging a focused claim (never letting an unrelated export check like `LOOPS` mask `problems()` or `classify()`);
    3. attribute each kill to the specific detecting test and assertion, recording unrelated execution errors separately; and
    4. justify every surviving candidate through an authoritative-claim evidence table (`Authoritative claim | Mutation | Witness | Observation | Judgment`) before adding durable `.test.mjs` Cases beside `test/contracts.test.mjs`—so implementation choices (such as hash-order sorting) are never promoted to permanent requirements without an authoritative claim or explicit proposal.
    Whether a reusable `skills/kaal-testing/scripts/` runner is earned is an explicit retrospective judgment after `testing/C73`.

## Carried Change Set, ACT & Automatic Promotion (`kaal/testing/multi-loop-sensitivity -> main`)

`testing/C71`, `C72`, and `C73` are three separate Changes carried by collector `kaal/testing/multi-loop-sensitivity` (established from `main`), closed by one collector ACT before automatic promotion:

| PR / Change | Role | Scope | Depends on |
| --- | --- | --- | --- |
| `testing/C71` (this PR) | **Plan** | `plan/multi-loop-sensitivity/` and deterministic RED Cases `T381`–`T383` in `test/plan/multi-loop-sensitivity/` | none |
| `testing/C72` | **Do (Skill + Trial)** | Update `SKILL.md` (`description` + `## Testing loops`), update heading pins in `T156.test.mjs` / `T160.test.mjs`, execute & record the 5-item judged Skill trial, rename `T381`–`T383` to `.test.mjs`, add `test/plan/multi-loop-sensitivity.test.mjs` to `package.json` `scripts.test` | `testing/C71` |
| `testing/C73` | **Do / Check (Pilot)** | One-off attributable mutation trial on `lib/contracts.mjs` with the 5-column claim/witness table; add justified durable `.test.mjs` Cases beside `test/contracts.test.mjs` for confirmed contract gaps; record BASS judgment | `testing/C72` |
| Sync (if `main` advances) | — | Pure merge commit from `main` into collector | as needed |
| **ACT** (`testing/RT…`) | **Act (Collector Retro)** | One retrospective PR into the collector (`plan/multi-loop-sensitivity/act.md`) reflecting the complete carried Change set (`C71`–`C73`) and verifying closure | `testing/C73` |
| **Promotion** (`kaal/testing/multi-loop-sensitivity -> main`) | **Promote** | Raised automatically once the collector holds its completed Change set and ACT | ACT landed |

## Explicitly Deferred (Follow-up Change)

- Wiring any extracted `kaal-testing` sensitivity/mutation script into `engineering/` (while developing toward deployment) or into `.kaal/` / `.kaal/config/guard/` (once published on npmjs).
- Aligning `packages/kaal-testing/README.md` or `payload/Testing.md` if desired in a later Change.
