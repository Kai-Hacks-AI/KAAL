# Multi-Loop Testing and Sensitivity: Evidence

Baseline: `origin/main` at `af8f3968`, observed locally on Windows (`Node v24.20.0`). On PR #2213 head `aefe17996272f5ea0f7d7a6f2144e7bbc4312acf`, the CI `Workspaces` job on `ubuntu-latest` (Node 24) built and passed (`https://github.com/Kai-Hacks-AI/KAAL/actions/runs/44892609943/job/136811481283`, run `44892609943`), confirming that `kaal-testing`'s declared dependencies (`kaal-engineer-skill` and `@kaihacksai/kaal-hosting`, already imported by `test/testing.test.mjs`) build and pass in CI.

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

The throwaway reference implies no wording of `testing/C72`. Whether the Skill actually teaches composable dimensions, behavioural RED, and targeted mutation verification is judged by the unbiased 5-item Skill trial in `testing/C72`, not by `T381`–`T383`.

## Exploratory Baseline Evidence for `testing/C73` (`lib/contracts.mjs`)

In an exploratory Node 24 `module.registerHooks` run against `packages/kaal-testing/lib/contracts.mjs` and `packages/kaal-testing/test/contracts.test.mjs` at `origin/main` (`af8f3968`, Windows `Node v24.20.0`, `--test-isolation=none`), the existing suite passed (exit 0) and failed on a broad inert stub (`LOOPS = []`, `problems = () => []`, `classify = async () => []`). Out of 15 source-derived mutations challenged against that suite:

- **Rejected by `test/contracts.test.mjs` (3 / 15):**
  1. `incomplete review missing pr/commit/hashes accepted`
  2. `crafted per-test status accepted`
  3. `parent traversal '..' in repoPath accepted`
- **Not rejected by `test/contracts.test.mjs` (12 / 15 — bounded test-gap candidates, not production defect claims or an overall quality score):**
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

**Calibration & provenance limits of this exploratory run:** (1) kills were detected only via `/ERR_ASSERTION/` in TAP output rather than structured per-test attribution; (2) the broad `INERT_STUB` can be rejected by `assert.deepEqual(LOOPS, ["conformance", "acceptance"])` alone without exercising `problems()` or `classify()`; (3) source-derived mutations do not by themselves establish which distinctions are authoritative contracts vs. uncontracted implementation choices (such as hash-order sorting); and (4) the exploratory runner file was removed with old `T381`, leaving names alone without inline `from`/`to` diffs. In `testing/C73`, the one-off trial re-runs under the attributable protocol and **retains every exact `from`/`to` mutant definition (or patch) alongside the subject commit SHA**, consumer check, and 5-column authoritative-claim table in `testing/C73`'s Change record.

## Reproduce

```sh
node packages/kaal-testing/test/plan/multi-loop-sensitivity/run-red.mjs
```
