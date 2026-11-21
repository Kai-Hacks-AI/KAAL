# Multi-Loop Testing and Sensitivity: Testing

The planned Cases live in `packages/kaal-testing/test/plan/multi-loop-sensitivity/`, named `T<n>.red.mjs` with shared helpers in `lib.mjs` and runner `run-red.mjs`. Each Case exports `id`, `tests`, `title`, and `run()`. They stay outside `packages/kaal-testing/package.json` `scripts.test` until their respective DO Change turns them GREEN (`testing/C70` for `T378`–`T380`; `testing/C71` for `T381`) and renames them to `.test.mjs`.

| Case | Checks | What it decides deterministically |
| --- | --- | --- |
| `testing/T378` | `testing/F152` | Structure only (`testing/N28`): `## Testing loops` replaces `## The three loops` in place; covers upward chain (`src`, `architecture`, `requirements`, `intent`), lateral/multiple targets (`defect`), extensible loops, tracing to served loop, and separate evidence per loop |
| `testing/T379` | `testing/F153` | Structure only (`testing/N28`): `## Testing loops` carries labelled checkpoints for **Behavioural RED** (inert stub vs. blocked) and **Targeted Mutation Verification** (assertion-only kill, outcome classes `killed`/`survived`/`invalid`/`unresolved`, tracing to owning claim and `references/findings.md`) |
| `testing/T380` | `testing/N34` | Boundary & Skill conformance: `skills/kaal-testing/` holds only `SKILL.md` and `references/findings.md`; `checkSkill("kaal-testing", ...)` passes cleanly; `capability/Testing.md` and `payload/Testing.md` keep exact LF SHA-256 bytes; `## Testing loops` names no hardcoded KAAL repo paths |
| `testing/T381` | `testing/F154` | Pilot sensitivity on `lib/contracts.mjs`: runs `test/contracts.test.mjs` via Node 24 `registerHooks` against (a) an inert stub (must fail on `ERR_ASSERTION`) and (b) targeted contract mutants derived from `lib/contracts.mjs` (every mutant must be killed by `ERR_ASSERTION`; any survivor fails naming the unpinned contract clause) |

`T378` and `T379` verify structure and labelled concepts, never prose sentences (`testing/N28`).

## RED evidence

Run `node packages/kaal-testing/test/plan/multi-loop-sensitivity/run-red.mjs`. See `evidence.md`.
