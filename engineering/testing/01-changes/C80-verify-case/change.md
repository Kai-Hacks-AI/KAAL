# C80 change

## PLAN

1. Add the drafts in `interface.md`: Intent `testing/I48`, Requirement `testing/F173`, Architecture `testing/A59`, Control `testing/CTL1` (`verify Case`, detective first), and the judge `engineering/testing/13-source/scripts/judge-verify-case.mjs` with its command line.
2. Add the planned Cases `testing/T397` to `testing/T401` (`T397.red.mjs`–`T401.red.mjs`, single-quoted `id` and `tests`), all RED on this PLAN tree:
   - `testing/T397` (`testing/I48`): `I48.md` exists and equals its draft.
   - `testing/T398` (`testing/F173`): `F173.md` exists, declares `serves: [testing/I48]`, and equals its draft.
   - `testing/T399` (`testing/A59`, `testing/F173`): `A59.md` and `judge-verify-case.mjs` equal their drafts, and `judgeVerifyCase` returns `PASS` (`applies: false` when empty, `applies: true` when all Cases are valid), `FAIL` naming path and rule for `missing-id`, `invalid-id`, `unattributed-case`, `unknown-subject`, `stale-header`, `duplicate-id`, and `missing-run`, and `UNKNOWN` (never `PASS`) for unusable input, with `FAIL` outranking `UNKNOWN`.
   - `testing/T400` (`testing/F173`): the CLI over scratch trees exits `0` (`PASS`) on valid Cases (including Cases whose helper template strings contain `export const tests = [...]` before the top-level export), `1` (`FAIL`) on an unattributed Case (`tests = []`) or stale line-1 header, and `2` (`UNKNOWN`) when `--root` is missing or unreadable.
   - `testing/T401` (`testing/CTL1`): `CTL1.md` equals its draft, `find-controls.mjs` lists `testing/CTL1` (`detective`, `designed`, `has: ['testing/I48']`, `evidence: [fixture:2, real:1, provoked:1:fail]`), and `check-controls.mjs` accepts `engineering/testing`.
3. Observe expected behavioural RED on this PLAN tree, verify in a disposable scratch copy that all five Cases turn GREEN with the DO files placed and that `judgeLayout` returns `PASS` on both the PLAN tree and the DO tree (`evidence.md`).
4. This PLAN changes no workflow, no githook, no ruleset, and nothing under `packages/` or `.github/`.

## Ids

Change `testing/C80`, Intent `testing/I48`, Requirement `testing/F173`, Architecture `testing/A59`, Control `testing/CTL1`, Cases `testing/T397` to `testing/T401`.

## What it checks, and what it leaves to others

- **Checks:** That every Case file in scope has a valid top-level scoped `id`, a non-empty top-level `export const tests = [...]` whose targets exist in the tree's known subject ids (when supplied), an exported `run` function, no duplicate `id`, and a line-1 `// Case <id> tests: ...` comment (if present) that agrees with `id` and `tests`.
- **Leaves to others:**
  - Whether every subject has at least one Case or every Case is wired into a runnable suite (`demand Cases`, next Test Control).
  - Whether a DO silently weakens or skips existing Cases (`limit Test-Drift`).
  - Whether Cases actually executed and passed (`observe Cases`).
  - Whether the Cases' assertions are strong, non-tautological, or sufficient (Testing review and Owner judgment).

## DO

On the merged PLAN, place the five drafted files into the `package-layout.json` structure under `engineering/testing/` and rename `T397.red.mjs`–`T401.red.mjs` to `.test.mjs` in their verified folders:

1. `engineering/testing/10-intent/I48-cases-are-well-formed/I48.md` + `10-intent/test-cases/T397.test.mjs`
2. `engineering/testing/11-requirements/F173-verify-case/F173.md` + `11-requirements/test-cases/T398.test.mjs`, `T400.test.mjs`
3. `engineering/testing/12-architecture/A59-judge-verify-case/A59.md` + `12-architecture/test-cases/T399.test.mjs`
4. `engineering/testing/13-source/scripts/judge-verify-case.mjs` + `13-source/unit-tests/`
5. `engineering/testing/14-operations/controls/CTL1-verify-case/CTL1.md` + `14-operations/controls/CTL1-verify-case/T401.test.mjs`

## Rollout of `verify Case`, detective first

Following the ACT controls (`release/CTL24`, `CTL29`–`CTL31`):

1. **Observe (detective):** Run `judge-verify-case.mjs` against real repository folders and in pre-push githook feedback without blocking.
2. **Advisory CI:** Run behind a repository variable (`KAAL_FLAG=on` makes non-PASS exit 1 as an advisory check, not required by a ruleset) and collect `[fixture:2, real:1, provoked:1:fail]` evidence.
3. **Preventive (required):** Only after validation and the Owner's explicit authorization is the check required on a station/ruleset; from then on `UNKNOWN` never passes and `type` changes to `preventive` in its own Change.
