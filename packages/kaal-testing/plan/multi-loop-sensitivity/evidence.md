# Multi-Loop Testing and Sensitivity: Evidence

Baseline: `origin/main` at `af8f3968`, observed locally on Windows (`Node v24.20.0`). CI (`KAAL` / `Workspaces` on `ubuntu-latest`, Node 24) confirmed `kaal-testing`'s existing dependencies (`kaal-engineer-skill` and `@kaihacksai/kaal-hosting`, already imported by `test/testing.test.mjs`) build and pass in CI.

## RED of this PLAN (`testing/T381`–`testing/T383`)

Run:

```sh
node packages/kaal-testing/test/plan/multi-loop-sensitivity/run-red.mjs
```

Observed output (`Summary: 2 RED-observed, 1 GREEN, 0 ERROR`, exit 0):

| Case | Checks | Observed on `origin/main` | Reason |
| --- | --- | --- | --- |
| `testing/T381` | `testing/F156` | RED | the Skill still carries `"The three loops"` instead of `"Testing loops"` |
| `testing/T382` | `testing/N35` | GREEN (boundary guard) | `skills/kaal-testing/` currently contains only `SKILL.md` and `references/findings.md`, and `checkSkill` passes cleanly; guards against adding `scripts/`, extra `references/`, or invalid frontmatter in `testing/C72` |
| `testing/T383` | `testing/N35` | RED | the Skill has no section `"Testing loops"` |

## Can each Case pass, and fail for the right reason

Verified against a throwaway reference Skill directory in a temporary folder (`KAAL_TESTING_SKILL_DIR`, deleted immediately afterwards), copied from `skills/kaal-testing/` with `## The three loops` replaced by `## Testing loops`:

- **Throwaway reference:** `0 RED-observed, 3 GREEN, 0 ERROR` (`T381`, `T382`, `T383` all GREEN).
- **Mutants of the throwaway reference** (each mutating only the clean reference):
  - **M1a** (retains `## The three loops`): `T381` RED (`T383` also RED because `## Testing loops` is absent).
  - **M1b** (`## Testing loops` moved after `## Running acceptance`): **only `T381` RED**; `T382` and `T383` GREEN.
  - **M2** (adds `scripts/mutate.mjs` inside the Skill): **only `T382` RED** (`skills/kaal-testing/ holds only SKILL.md and references/`); `T381` and `T383` GREEN.
  - **M3** (adds `references/extra.md`): **only `T382` RED** (`references/ holds only findings.md`); `T381` and `T383` GREEN.
  - **M4** (corrupts `SKILL.md` frontmatter `name: Wrong Name`): **only `T382` RED** (`checkSkill` reports `standard` finding); `T381` and `T383` GREEN.
  - **M5** (inserts hardcoded `.kaal/config` inside `## Testing loops`): **only `T383` RED**; `T381` and `T382` GREEN.

The throwaway reference implies no wording of `testing/C72`. Whether the Skill actually teaches composable loops, behavioural RED, and targeted mutation verification is judged by the Skill trial in `testing/C72`, not by `T381`–`T383`.

## Change Evidence for `testing/C73`: Pilot Baseline on `lib/contracts.mjs`

Observed in a one-off Node 24 `module.registerHooks` sensitivity run against `packages/kaal-testing/lib/contracts.mjs` and `packages/kaal-testing/test/contracts.test.mjs` at `origin/main` (`af8f3968`, Windows `Node v24.20.0`, `--test-isolation=none`):

- **Baseline `test/contracts.test.mjs`:** GREEN (exit 0).
- **Inert stub (`LOOPS = []`, `problems = () => []`, `classify = async () => []`):** `killed` (`ERR_ASSERTION`) — confirms `test/contracts.test.mjs` reaches behavioural RED against a neutral stub.
- **Targeted contract mutants killed (3 / 15):**
  1. `incomplete review missing pr/commit/hashes accepted`
  2. `crafted per-test status accepted`
  3. `parent traversal '..' in repoPath accepted`
- **Targeted contract mutants that survived (12 / 15 — potential defects in `test/contracts.test.mjs` for `testing/C73` to pin with ordinary durable Cases):**
  1. `owner kind mismatch accepted`
  2. `owner name mismatch accepted`
  3. `malformed owner accepted (isRef skipped)`
  4. `non-array statements accepted`
  5. `empty quote accepted`
  6. `invalid statement sha256 accepted`
  7. `missing limits with offered evidence accepted`
  8. `invalid evidence sha256 accepted`
  9. `empty evidence test path accepted`
  10. `stale review statement hash treated as at-pins`
  11. `permuted review evidence hash order falsely marked stale`
  12. `missing source file treated as present`

## Reproduce

```sh
node packages/kaal-testing/test/plan/multi-loop-sensitivity/run-red.mjs
```
