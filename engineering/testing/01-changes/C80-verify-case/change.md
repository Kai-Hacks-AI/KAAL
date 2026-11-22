# C80 change

## PLAN

1. Establish the four-layer producer/consumer architecture in `C80.md`, `baseline.md`, and `interface.md` without adding another Case parser or duplicating `C69`:
   - `@kaihacksai/kaal-hosting` (shared AST source inspection): extracts top-level exports and comments, reporting real exports with their value/function classification (e.g., `export const run = 42` is reported as a real non-function export, never hidden as absent, while template strings and block comments are ignored and trailing comments accepted).
   - `kaal-testing/cases` (`C74` `readCase` adapter) + `kaal-testing/form` (`C69` as explicitly amended for `C80`, `checkCaseForm` → `kaal-testing/case-form@1`): interprets extracted exports into `id`, `tests`, and callable `run` (`Testing` decides `run = 42` violates the Case contract), keeps `absent-attribution` distinct from `malformed-attribution`, `missing-run` distinct from `non-callable-run`, `stale-header` respecting `testing/F152`'s trailing `.`/prose rule, `catalog.complete`, `targets.checked`, and `unverified-target` vs. authoritative `unknown-subject`.
   - `engineering/testing/13-source/scripts/judge-verify-case.mjs` (`testing/C80`, `testing/CTL1`): thin contextual Control consuming `case-form@1` and strict `subjectPolicy`, requiring positive `catalog.complete === true` and `targets.checked === true`, rejecting invalid/wildcard policies (`invalid-policy`), and preserving checker findings and uncertainty verbatim.
2. Add the planned Cases `testing/T397` to `testing/T401` as **ordinary `.test.mjs` files** in `engineering/testing/01-changes/C80-verify-case/` (single-quoted `id` and `tests`, RED by assertion on this PLAN tree, **never parked as `.red.mjs` and never renamed in DO**):
   - `T397.test.mjs` (`testing/I48`): `I48.md` exists and equals its draft.
   - `T398.test.mjs` (`testing/F173`): `F173.md` exists, declares `serves: [testing/I48]`, and equals its draft.
   - `T399.test.mjs` (`testing/A59`, `testing/F173`): `A59.md` and `judge-verify-case.mjs` equal their drafts, and `judgeVerifyCase` maps `case-form@1` inputs fail-closed:
     - `PASS` requires `catalog.complete === true` and `targets.checked === true` (`applies: false` when `files` is empty, `applies: true` when non-empty).
     - Missing `catalog`, missing `targets`, non-boolean `'true'`, explicit `false`, or non-string `files` entries yield `UNKNOWN` (`applies: true`), never `PASS`.
     - `FAIL` preserves authoritative defects (`no-id`, `missing-id`, `invalid-id`, `duplicate-id`, `absent-attribution`, `malformed-attribution`, `missing-run`, `non-callable-run`, `unknown-subject`, `stale-header`) verbatim; `FAIL` outranks `UNKNOWN`.
     - Strict `subjectPolicy` validation rejects empty `{}` rules, unknown keys (`{ typo: 'legacy' }`, `{ unknownKey: [] }`), wrong types, and attempts to exempt uncertainty or non-exemptible failures (`missing-run`, `non-callable-run`, `unverified-target`, `unreadable`) as `UNKNOWN` (`invalid-policy`); valid explicit legacy `stale-header`/`first-line` exemptions retain `{ finding, exemption }` in `policyExempt`.
   - `T400.test.mjs` (`testing/F173`): `judge-verify-case.mjs` CLI (`--report <case-form.json> [--policy <policy.json>]`) exits `0` (`PASS`), `1` (`FAIL`), and `2` (`UNKNOWN`, including incomplete report without `catalog`/`targets`, `unverified-target`, or malformed policy JSON).
   - `T401.test.mjs` (`testing/CTL1`): `CTL1.md` equals its draft, `find-controls.mjs` lists `testing/CTL1` (`detective`, `designed`, `has: ['testing/I48']`, `evidence: [fixture:2, real:1, provoked:1:fail]`), and `check-controls.mjs` accepts `engineering/testing`.
3. Verify behavioural RED on this PLAN tree, Case discovery (`collectCases` and honest `cases.test.mjs` observation), throwaway DO GREEN verification, and `judgeLayout` `PASS` (`evidence.md`).

## Deployment Path (N / N+1 Separation)

| Layer | Responsibility | Location / Package | Deployment Path |
| --- | --- | --- | --- |
| **1. Shared source inspection** | AST/lexical extraction of top-level exports (reporting value/function classification) and comments | Engineered in `packages/kaal-hosting` | Built into `dist/`, shipped by `@kaihacksai/kaal-hosting` (N / N+1) |
| **2. Case adapter & form checker** | Interpret declarations (`readCase`) and check reusable Case form (`checkCaseForm` -> `case-form@1`) | Engineered in `packages/kaal-testing` (`C74`, amended `C69`/`C70`) | Delivered in `packages/kaal-testing/lib/` (`./cases`, `./form`) for N / N+1 use |
| **3. Contextual Control judge** | Map `case-form@1` + strict `subjectPolicy` to `PASS / FAIL / UNKNOWN` + `applies` | Deployed in `engineering/testing/13-source/scripts/judge-verify-case.mjs` | N+1 engineering consumer of `kaal-testing/form` (no re-parsing) |
| **4. Repository config & wiring** | Control node (`CTL1`), `subjectPolicy`, deferred githook / CI workflows | `engineering/testing/14-operations/controls/CTL1-verify-case/` + `.github/` | Repository-local content and wiring only |

## Ordered Prerequisites, Accountable Owners, and `C69` Amendment

`C80` depends on an explicit amendment to `testing/C69`'s `kaal-testing/case-form@1` contract (`testing/F152`–`F155`, `F164`) executed in this exact dependency order:

| Order | Prerequisite | Accountable Owner | Contract / Negative-Case Obligation |
| --- | --- | --- | --- |
| **1** | **Hosting shared source inspection** | `kaal-hosting` | Extracts top-level exports and comments accurately via AST/lexer; ignores unindented template strings and block comments; accepts trailing comments (`export const id = 'x/T1'; // note`); **reports real exports such as `export const run = 42` with their non-function classification** rather than hiding them as absent. |
| **2** | **Testing `C74` `readCase` upgrade + `C69`/`C70` `case-form@1` amendment** | `kaal-testing` | Upgrades `readCase` to consume Hosting inspection; amends `C69`'s `case-form@1` contract to add `absent-attribution` vs. `malformed-attribution` (`tests = [foo]`), `missing-run` vs. `non-callable-run` (`run = 42` judged non-compliant by Testing), `stale-header` respecting `testing/F152` trailing `.`/prose, explicit `catalog: { complete }`, `targets: { checked }`, and `unverified-target` vs. `unknown-subject`, with negative Cases in `kaal-testing`. |
| **3** | **Authoritative subject resolver** | Engineering / Consumers | Resolves frontmatter `id:`, fenced ` ````` ` PLAN drafts, Defects, Changes, registered Goals, and inline spec requirements; while incomplete, unfound targets emit `unverified-target`, never `unknown-subject`. |
| **4** | **Phase-aware / layout-aware Case execution route** | Engineering (`engineering/cases`) | Either updates `engineering/cases/cases.test.mjs` (currently not phase-aware and restricted to POSIX `/^0[0-6]-/`) or runs via `kaal-testing/cases` (`collectCases`) + `kaal-testing run` with `kaal-testing/expectations` (`--expect`) / `kaal-testing/observe` so PLAN-phase expected RED is accounted for cleanly without passing readiness, and DO Cases placed under `10-intent/`..`14-operations/` continue executing post-DO. |
| **5** | **`C80` DO (`engineering/testing/`)** | `kaal-testing` / Engineering | Places `I48.md`, `F173.md`, `A59.md`, `CTL1.md`, and `judge-verify-case.mjs` into `package-layout.json` folders and keeps `T397.test.mjs`–`T401.test.mjs` as plain `.test.mjs` Cases under `10-intent/test-cases/`..`14-operations/controls/CTL1-verify-case/` executed by the Step 4 route. |

## Ids

Change `testing/C80`, Intent `testing/I48`, Requirement `testing/F173`, Architecture `testing/A59`, Control `testing/CTL1`, Cases `testing/T397` to `testing/T401`.

## Rollout of `verify Case`, detective first

1. **Observe (detective):** Run `kaal-testing check-cases` → `judge-verify-case.mjs` on real repository paths and classify remaining findings until false `FAIL`s = 0.
2. **Advisory CI / Pre-push feedback:** Behind `KAAL_FLAG=on` while collecting `[fixture:2, real:1, provoked:1:fail]` evidence.
3. **Preventive (required):** Only after validation and explicit Owner authorization.
