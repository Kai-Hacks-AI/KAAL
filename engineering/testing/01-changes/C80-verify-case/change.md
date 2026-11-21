# C80 change

## PLAN

1. Establish the four-layer producer/consumer architecture in `C80.md`, `baseline.md`, and `interface.md` without adding another Case parser or duplicating `C69`:
   - `packages/kaal-hosting`: bounded provider prerequisite for syntax/AST-accurate declaration extraction (distinguishing top-level exports from template strings, block comments, and non-callable values).
   - `packages/kaal-testing` (`C74` `readCase` + `C69`/`C70` `lib/form.mjs`): reusable Case adapter and Case-form checker (`kaal-testing/case-form@1`), keeping `absent-attribution` distinct from `malformed-attribution`, `missing-run` distinct from `non-callable-run`, and `unknown-subject` distinct from `unverified-target`.
   - `engineering/testing/13-source/scripts/judge-verify-case.mjs` (`testing/C80`, `testing/CTL1`): thin contextual Control consuming `case-form@1` and `subjectPolicy`, preserving checker findings and uncertainty verbatim.
2. Add the planned Cases `testing/T397` to `testing/T401` as **ordinary `.test.mjs` files** in `engineering/testing/01-changes/C80-verify-case/` (single-quoted `id` and `tests`, RED by assertion on this PLAN tree, **never parked as `.red.mjs` and never renamed in DO**):
   - `T397.test.mjs` (`testing/I48`): `I48.md` exists and equals its draft.
   - `T398.test.mjs` (`testing/F173`): `F173.md` exists, declares `serves: [testing/I48]`, and equals its draft.
   - `T399.test.mjs` (`testing/A59`, `testing/F173`): `A59.md` and `judge-verify-case.mjs` equal their drafts, and `judgeVerifyCase` maps `case-form@1` inputs cleanly: `PASS` (`applies: false` when empty, `applies: true` when clean), `FAIL` preserving `missing-id`/`no-id`, `invalid-id`, `duplicate-id`, `absent-attribution`, `malformed-attribution`, `missing-run`, `non-callable-run`, `stale-header`, `unknown-subject`, and upstream template/comment-spoofing findings; `UNKNOWN` (never `PASS`, never false `FAIL`) when `case-form@1` is missing/invalid, `catalog.complete === false`, or `unverified-target` / `unchecked` occurs; `FAIL` outranks `UNKNOWN`; policy-exempt legacy items remain listed in `policyExempt` without hiding them silently.
   - `T400.test.mjs` (`testing/F173`): `judge-verify-case.mjs` CLI (`--report <case-form.json> [--policy <policy.json>]`) exits `0` (`PASS`), `1` (`FAIL` for `malformed-attribution`, `non-callable-run`, `absent-attribution`, `stale-header`), and `2` (`UNKNOWN` for `unverified-target`, incomplete catalog, or missing/invalid report).
   - `T401.test.mjs` (`testing/CTL1`): `CTL1.md` equals its draft, `find-controls.mjs` lists `testing/CTL1` (`detective`, `designed`, `has: ['testing/I48']`, `evidence: [fixture:2, real:1, provoked:1:fail]`), and `check-controls.mjs` accepts `engineering/testing`.
3. Verify behavioural RED on this PLAN tree, phase-aware discovery through `kaal-testing/cases` (`collectCases`) and `engineering/cases/cases.test.mjs` (without hiding `.test.mjs` files to fake CI green), throwaway DO GREEN verification, and `judgeLayout` `PASS` (`evidence.md`).

## Deployment Path (N / N+1 Separation)

| Layer | Responsibility | Location / Package | Deployment Path |
| --- | --- | --- | --- |
| **1. Shared source inspection** | AST/lexical extraction of top-level exports, comments, and callable `run` | Engineered in `packages/kaal-hosting` | Built into `dist/`, shipped by `@kaihacksai/kaal-hosting` (N / N+1) |
| **2. Case adapter & form checker** | Interpret declarations (`readCase`) and check reusable Case form (`checkCaseForm` -> `case-form@1`) | Engineered in `packages/kaal-testing` (`C74`, `C69`/`C70`) | Delivered in `packages/kaal-testing/lib/` (`./cases`, `./form`) for N / N+1 use |
| **3. Contextual Control judge** | Map `case-form@1` + repository subject policy to `PASS / FAIL / UNKNOWN` + `applies` | Deployed in `engineering/testing/13-source/scripts/judge-verify-case.mjs` | N+1 engineering consumer of `kaal-testing/form` (no re-parsing) |
| **4. Repository config & wiring** | Control node (`CTL1`), `subjectPolicy`, deferred githook / CI workflows | `engineering/testing/14-operations/controls/CTL1-verify-case/` + `.github/` | Repository-local content and wiring only |

## Upstream Provider Negative-Case Obligations (Dependency Order)

C80 DO waits on these bounded upstream deliverables, each carrying its negative Cases at its owning layer:
1. **Hosting shared inspection (bounded provider Change):** negative Cases proving unindented template strings (`const ex = \`\nexport const id = ...;\n\``), block comments (`/* export const id = ... */`), and non-callable values (`export const run = 42`) are not returned as executable exports, while trailing comments (`export const id = 'x/T1'; // note`) are extracted cleanly.
2. **Testing `C74` `readCase` upgrade + `C69`/`C70` `lib/form.mjs`:** negative Cases testing `absent-attribution` (`tests = []` or omitted) vs. `malformed-attribution` (`tests = [foo]`), `missing-run` vs. `non-callable-run`, `stale-header` respecting `testing/F152` trailing `.`/prose, and `unverified-target` vs. authoritative `unknown-subject`.
3. **Authoritative subject resolver:** resolves frontmatter `id:`, fenced ` ````` ` PLAN drafts, Defects (`15-defects/`/`06-defects/`), Changes (`C<n>`), registered Goals (`G<n>`), and inline spec requirements; while partial, unfound targets stay `unverified-target` (`UNKNOWN`), never false `FAIL`.
4. **C80 DO (`engineering/testing/`):** places `I48.md`, `F173.md`, `A59.md`, `CTL1.md`, and `judge-verify-case.mjs` into their `package-layout.json` folders and keeps `T397.test.mjs`–`T401.test.mjs` as plain `.test.mjs` Cases (moving or running in place without `.red.mjs` renames).

## Ids

Change `testing/C80`, Intent `testing/I48`, Requirement `testing/F173`, Architecture `testing/A59`, Control `testing/CTL1`, Cases `testing/T397` to `testing/T401`.

## Rollout of `verify Case`, detective first

1. **Observe (detective):** Run `kaal-testing check-cases` → `judge-verify-case.mjs` on real repository paths and classify remaining findings until false `FAIL`s = 0.
2. **Advisory CI / Pre-push feedback:** Behind `KAAL_FLAG=on` while collecting `[fixture:2, real:1, provoked:1:fail]` evidence.
3. **Preventive (required):** Only after validation and explicit Owner authorization.
