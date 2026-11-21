# Multi-Loop Testing and Sensitivity: Testing

Verification of this Change splits cleanly between **deterministic Cases** (heading placement and Skill boundaries) and a **judged Skill trial** (whether the Skill actually teaches the method to an agent).

## Deterministic Cases (`testing/T381`–`testing/T383`)

The planned Cases live in `packages/kaal-testing/test/plan/multi-loop-sensitivity/`, named `T<n>.red.mjs` with shared helpers in `lib.mjs` and runner `run-red.mjs`. Each Case exports `id`, `tests`, `title`, and `run()`. They stay outside `packages/kaal-testing/package.json` `scripts.test` until `testing/C72` turns them GREEN and renames them to `.test.mjs`.

| Case | Checks | What it decides deterministically |
| --- | --- | --- |
| `testing/T381` | `testing/F156` | Heading placement only: `## Testing loops` exists in `skills/kaal-testing/SKILL.md`, `## The three loops` is removed, and `## Testing loops` stands right after `## Assessing a test against its claim` and before `## Running acceptance` |
| `testing/T382` | `testing/N35` | Skill surface & conformance: `skills/kaal-testing/` holds only `SKILL.md` and `references/` (with only `findings.md`, no `scripts/`), and `kaal-engineer-skill`'s `checkSkill("kaal-testing", ...)` passes with `{ standard: [], kaal: [], warnings: [] }` |
| `testing/T383` | `testing/N35` | Consumer-agnostic boundary: `## Testing loops` is present and names no hardcoded KAAL repository paths (`.kaal/`, `engineering/`, `packages/`) |

`T381`–`T383` check only structure and boundaries—never prose wording (`testing/N28`), never byte-level SHA-256 locks on `capability/` or `payload/`, and never duplicate export/dependency checks already held by `T369`.

## Judged Skill Trial (`testing/C72`)

Whether `## Testing loops` teaches composable loops, behavioural RED, and targeted mutation verification is a judgment, never a regex over Skill text. In `testing/C72`, an independent trial runs fresh agents with and without the updated `SKILL.md` against claims/contracts and checks all four CPO acceptance criteria:

1. identifying the claims needing evidence and tracing them to their owning concerns;
2. choosing and composing the appropriate loops (including evidence serving multiple concerns without merging them);
3. distinguishing behavioural RED (assertion failure against an inert/unfixed subject) from blocked execution;
4. using targeted mutations to expose inadequately tested contracts and reporting surviving mutants as calibrated findings with their owning claims.

The trial records its protocol, author's key, raw transcripts (with prompt hashes), and judged observations citing verbatim excerpts found in the transcripts in the Change's trial record.

## One-Off Sensitivity Pilot (`testing/C73`, Change Task)

The 15-mutant baseline run on `packages/kaal-testing/lib/contracts.mjs` (3 killed, 12 survived against `test/contracts.test.mjs`) is Change evidence recorded in `evidence.md`, not a standing Case. In `testing/C73`, that one-off trial drives adding ordinary, durable `.test.mjs` Cases beside `test/contracts.test.mjs` to pin each surviving invariant, leaving `npm test` free of an embedded mutation harness.

## RED evidence

Run `node packages/kaal-testing/test/plan/multi-loop-sensitivity/run-red.mjs`. See `evidence.md`.
