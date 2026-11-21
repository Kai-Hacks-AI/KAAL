# testing/C72 DO: Skill Revision, Judged Trial, and Case Integration

- **Change:** `testing/C72` (`testing/c72-do` → `kaal/testing/multi-loop-sensitivity`, continuing `testing/C71` PLAN merged at `69025fca`).
- **Scope:** Author `SKILL.md` updates, execute the pre-frozen 5-item judged Skill trial on `budget-gate`, and integrate `testing/T381`–`T383` into `packages/kaal-testing`'s test suite (`testing/C73` `lib/contracts.mjs` sensitivity trial follows in a separate Change).

## 1. Testing Skill Update and Pin Maintenance

- **`packages/kaal-testing/skills/kaal-testing/SKILL.md`:**
  - Updated frontmatter `description` to state the composable testing-loop scope, Behavioural RED vs. blocked execution distinction, targeted mutation verification, and uncovered-behaviour handling.
  - Replaced `## The three loops` with `## Testing loops`, articulating the two composable dimensions (Concern/Claim ownership vs. Evidence method/boundary), preserving Architecture conformance (`permitted`/`prohibited`/`undecidable`), Capability acceptance (fresh install, public interface, promised failures across supported hosts), Implementation Behavioural RED + Targeted Mutation Verification (`killed`/`survived`/`invalid`/`unresolved`), qualified observation reuse rules, and narrow uncovered-behaviour discipline (establishing contractual authority, necessity, and consumer dependencies before removing uncovered code or writing contract cases).
  - Left `packages/kaal-testing/skills/kaal-testing/` strictly confined to `SKILL.md` and `references/findings.md` (zero added `scripts/` or reference files).
- **Heading-pin updates:** Updated `'The three loops'` → `'Testing loops'` in `packages/kaal-testing/test/plan/testability/T156.test.mjs` and `packages/kaal-testing/test/plan/testability/T160.test.mjs`.

## 2. Pre-Frozen Trial Provenance and Execution (`trial/`)

All trial fixtures and evaluation criteria were frozen and committed **before** modifying `SKILL.md`:

- **Freeze commit:** `cdddee30` (`testing/C72: freeze trial subject, prompt, and assessment key before Skill edit`), containing:
  - `trial/subject/spec.md`, `trial/subject/budget.mjs`, `trial/subject/budget.checks.mjs` (observed `2/2` pass, exit `0`), `trial/subject/broken.checks.mjs` (observed exit `1`, `ERR_MODULE_NOT_FOUND` on `./missing-fixture.mjs`),
  - `trial/prompt.common.txt`, `trial/key.json` (`N1`–`N5`), and `trial/protocol.md`.
- **Parity & Manifest (`trial/do/manifest.json`):**
  - Four fresh `research` subagent runs (`n = 2` baseline arm, `n = 2` skill arm) received identical common prompt text (`trial/prompt.common.txt`), workspace state, and no runtime hints beyond their injected `SKILL.md` revision (`baselineCommit: 69025fca` vs. updated `SKILL.md`).
  - LF-normalized SHA-256 digests computed with `@kaihacksai/kaal-foundation/sha256`:
    - `keySha256`: `4dad8f19483404577140eadb1d6e334fd7e091f7d37841c1060ba24f4dd51481`
    - `commonPromptSha256`: `be7240e98fb74256f86d9226bb974ab1f58069af95014f7b18093a473ba86a54`
    - Baseline arm (`skillSha256`: `fa1147c01e12088f4be3fb9e1dc8fbaeb0b614310da6c148798215cf128a199e`, `promptSha256`: `39f61373086637092ff1260ca1f6438fba6bf952210f3153c2c493a5f6d13457`): `trial/do/run1/baseline.raw.txt`, `trial/do/run2/baseline.raw.txt`
    - Skill arm (`skillSha256`: `89c9712c34cde3f734bfff1ffa6d6d50ebaffdbb275f83034cb3e2911094b1be`, `promptSha256`: `3d13044c2462d37bda30b26827c251638141566349d9c5e8f25b5483e35ad48f`): `trial/do/run1/skill.raw.txt`, `trial/do/run2/skill.raw.txt`

## 3. Independent Judgment Summary and Audit (`trial/do/judgment.md`)

A separate Judge `research` session evaluated `trial/key.json` against the four raw transcripts (without reading `SKILL.md` or repository files); its report is preserved verbatim in `trial/do/judgment.md`.

### Observed Repeatable Gains (`skill` vs. `baseline`)
1. **Targeted Mutation Verification & Behavioural RED (largest delta):** Baseline only listed missing edge/error test cases. Both `skill` runs framed the gap through inert-stub Behavioural RED and targeted mutant survival (pinpointing `total > limit` → `total >= limit` surviving `budget.checks.mjs`) using `killed`/`survived`/`invalid`/`unresolved` classifications; `run2/skill.raw.txt` explicitly paired the surviving mutant with concrete witnesses (`[{ cost: 5 }, { cost: 5 }], 10` and `[], 0`).
2. **Blocked Setup vs. Behavioural Failure:** Both `skill` runs explicitly used the Skill rule classifying `broken.checks.mjs` `ERR_MODULE_NOT_FOUND` as `blocked (unknown)` rather than Behavioural RED evidence for `BG-R2` (while also diagnosing the vacuous `assert.throws(() => sample, RangeError)` bug).
3. **Uncovered Behaviour & Consumer Calibration:** Baseline classified uncontracted `budget.mjs` code (`TypeError` on non-array `items`, `null` items, `BUDGET_AUDIT_FILE` / `existsSync`) as `Potential defect` and prescribed immediate removal of `node:fs` / `process.env.BUDGET_AUDIT_FILE`. Both `skill` runs classified contractual authority and consumer dependencies as `Unknown`, explicitly warning against inventing expectations or deleting uncovered code before checking consumers.

### Baseline Parity, Blind Spots, and Trial Limits
- **Shared baseline ceiling:** Because 7 of 8 `SKILL.md` sections were unchanged, both arms handled `BG-I1` (passive function vs. caller gating), `BG-R3` (underspecified → `Challenge`), `BG-R4` (clarity → `Point at judgement`, reject brittle wording assertions), loop/boundary separation (`test/acceptance/` on fresh tarballs), and 4-kind structure comparably.
- **Residual miss — qualified observation reuse:** Neither `skill` run explicitly articulated how one qualified observation can serve multiple claims without losing independence; both defaulted back toward separate-loops phrasing (`"Separate and build the three verification loops"` / `"execute Capability Acceptance as separate loops"`).
- **Shared 4-kind edge tension:** All four runs (including both `skill` runs) filed `broken.checks.mjs` (`ERR_MODULE_NOT_FOUND`) under `Verified failure` (`Subject: budget-gate`) despite stating it is `blocked (unknown)` in prose, while holding `budget.mjs`'s explicit `node:fs` import in `Potential defect` (`PD-1`) / `suspected` pending execution of a conformance check.
- **Trial limits:** Static read-only analysis (`n = 2` runs per arm on one ~23-line subject) measures prompt-level analytical discrimination, not live test authoring, conformance script execution, or mutation sweep execution.

### Verbatim Citation Verification (`71/73` exact)
All `73` double-backticked transcript excerpts in `trial/do/judgment.md` were deterministically verified against the raw `.raw.txt` files:
- **`71/73`** match character-for-character verbatim.
- **`2/73`** contain minor meaning-preserving wording slips by the Judge (`trial/do/judgment.md` is kept verbatim as produced by the Judge):
  1. `judgment.md:48` writes `` `In a local workspace run importing `./budget.mjs` directly, no violation was found within the coverage of these two specific inputs` ``; `trial/do/run2/skill.raw.txt:86` reads `In a local workspace run importing \`./budget.mjs\` directly, no violation was found within the narrow coverage of two concrete inputs`.
  2. `judgment.md:86` writes `` `Awaits a deterministic architecture conformance check to reproduce it as a verified failure (or removal/validation).` ``; `trial/do/run2/baseline.raw.txt:82` reads `Awaits a deterministic architecture conformance check to reproduce as a verified failure (or removal/validation).`.

## 4. `T381`–`T383` Integration

- Promoted `T381.red.mjs`, `T382.red.mjs`, and `T383.red.mjs` → `T381.test.mjs`, `T382.test.mjs`, and `T383.test.mjs` in `packages/kaal-testing/test/plan/multi-loop-sensitivity/` and removed `run-red.mjs`.
- Added aggregate suite `packages/kaal-testing/test/plan/multi-loop-sensitivity.test.mjs` and wired it into `packages/kaal-testing/package.json` `scripts.test`.
