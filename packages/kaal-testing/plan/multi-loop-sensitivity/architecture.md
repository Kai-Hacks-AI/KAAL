# Multi-Loop Testing and Sensitivity: Architecture

Each element names, in brackets, the Requirements it answers.

- **testing/A53** [testing/F156, testing/F157, testing/N35]: **One updated Skill (`SKILL.md` frontmatter `description` + `## Testing loops`); zero new shipped files.**
  - `skills/kaal-testing/SKILL.md` updates its frontmatter `description` for discovery alignment (evaluated by review and trial, not a regex) and replaces `## The three loops` with `## Testing loops` between `## Assessing a test against its claim` and `## Running acceptance` while keeping the rest of the section order intact.
  - Because `packages/kaal-testing/test/plan/testability/T156.test.mjs` and `T160.test.mjs` pin the exact heading name `The three loops`, `testing/C72` (DO) updates that pinned heading name in `T156.test.mjs` and `T160.test.mjs` (following the precedent of `testing/C68` updating `T160.test.mjs` in `#2117`). `testing/C71` (PLAN) touches neither `SKILL.md` nor `T156`/`T160`.
  - **Package execution integration (`testing/C72`):** Because `packages/kaal-testing/package.json` `scripts.test` lists test entrypoints explicitly rather than globbing, `testing/C72` promotes `T381`–`T383` from `.red.mjs` to `.test.mjs`, adds the aggregate entrypoint `packages/kaal-testing/test/plan/multi-loop-sensitivity.test.mjs` (matching `testability.test.mjs` and `expected-failures.test.mjs`), appends `test/plan/multi-loop-sensitivity.test.mjs` to `packages/kaal-testing/package.json` `scripts.test`, and verifies in `npm test` that all three Cases execute.
  - **Consumer-agnostic boundary & ownership:** The Skill keeps Concern/Claim and Evidence method/boundary composable, defines tracing and output expectations abstractly (stdout or caller-chosen path, never a hardcoded repository path), and classifies findings strictly within the existing four kinds in `references/findings.md` (`unknown` for unresolved authority/necessity, `architectural concern` for misplaced responsibility, `potential defect` only for plausible expectation violations). Testing holds no Defect creation, lifecycle, placement, correction, or closure.
  - **One-off sensitivity trial, provenance & execution integration (`testing/C73`):** The 15-mutant baseline run on `packages/kaal-testing/lib/contracts.mjs` (`evidence.md`) is exploratory Change evidence only, not a permanent Case or production defect score. In `testing/C73`, the one-off trial must:
    1. confirm the replacement hook actually intercepted `lib/contracts.mjs`;
    2. preserve unrelated valid exports/behaviours when challenging a focused claim (never letting an unrelated check like `LOOPS` mask `problems()` or `classify()`);
    3. attribute each kill to the specific detecting test and assertion, recording unrelated execution errors separately;
    4. retain the exact mutant `from`/`to` definitions (or patches) and subject commit SHA in `testing/C73`'s Change record so every trial challenge is inspectable and reproducible;
    5. evaluate every candidate through the 5-column table (`Authoritative claim | Mutation | Witness | Observation | Judgment`), checking contractual basis, necessity, and repo consumers for `./contracts` (noting explicitly that zero repo consumers does not prove zero external consumers for a public export) before proposing tests, contract clarification, or removal — never removing behaviour solely because no Case requires it; and
    6. integrate resulting durable contract assertions directly into the already-executed `packages/kaal-testing/test/contracts.test.mjs` (or into a named `.test.mjs` file added to `packages/kaal-testing/package.json` `scripts.test` and verified in `npm test`), leaving `npm test` free of an embedded mutation harness.
    Whether a reusable `skills/kaal-testing/scripts/` runner is earned is an explicit retrospective judgment after `testing/C73`.

## Carried Change Set, Structured ACT & Automatic Promotion (`kaal/testing/multi-loop-sensitivity -> main`)

`testing/C71`, `C72`, and `C73` are three separate Changes carried by collector `kaal/testing/multi-loop-sensitivity` (established from `main`), closed by one structured collector ACT before automatic promotion:

| PR / Change | Role | Scope | Depends on |
| --- | --- | --- | --- |
| `testing/C71` (this PR) | **Plan** | `plan/multi-loop-sensitivity/` and deterministic RED Cases `T381`–`T383` in `test/plan/multi-loop-sensitivity/` | none |
| `testing/C72` | **Do (Skill + Trial)** | Freeze trial key, update `SKILL.md` (`description` + `## Testing loops`), update heading pins in `T156.test.mjs` / `T160.test.mjs`, execute & judge the 5-item Skill trial (`n = 2` per arm), rename `T381`–`T383` to `.test.mjs`, add `test/plan/multi-loop-sensitivity.test.mjs` to `package.json` `scripts.test` | `testing/C71` |
| `testing/C73` | **Do / Check (Pilot)** | One-off attributable mutation trial on `lib/contracts.mjs` retaining mutant definitions/SHA and 5-column claim/consumer/judgment table; add durable contract assertions to `test/contracts.test.mjs` (or named `scripts.test` file); record BASS judgment | `testing/C72` |
| Sync (if `main` advances) | — | Pure merge commit from `main` into collector | as needed |
| **ACT** (`testing/RT1`) | **Act (Collector Retro)** | One structured retro object at `packages/kaal-testing/02-learnings/retros/RT1.md` (`id: testing/RT1`, provisional — verify unique across `kaal/testing/*` before ACT; `format: 4L`, `reflects: [testing/C71, testing/C72, testing/C73]`, recognized by `engineering/release-management/05-src/phase/write-map.json`) | `testing/C73` |
| **Promotion** (`kaal/testing/multi-loop-sensitivity -> main`) | **Promote** | Raised automatically once the collector holds its completed Change set and ACT | ACT landed |

## Tracked Follow-Ups (Outside This Change)

- **Wording drift alignment:** `payload/Testing.md` and `packages/kaal-testing/README.md` retain the existing triad phrasing while the Skill adopts composable dimensions; track aligning them as an explicit follow-up Change so discovery and documentation stay consistent without blocking this bounded Change.
- **Wiring:** Wiring any extracted `kaal-testing` sensitivity/mutation script into `engineering/` (while developing toward deployment) or into `.kaal/` / `.kaal/config/guard/` (once published on npmjs).
