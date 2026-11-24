# C80 evidence

## Provenance

- **Baseline:** `origin/main` at `4a244cb3` (after `testing/C74` hold-adapter `#2291`, `testing/C75`–`C77` seeded-properties `#2296`, and `testing/C78`–`C79` act-library-sensitivity `#2264`), observed on Windows (`win32`, Node `v24.20.0`).
- **Method:** Following the **C30 (`#2316` PLAN -> `#2318` DO)** precedent, `T397.test.mjs`–`T401.test.mjs` are committed in PLAN as plain `.test.mjs` files in their destination `package-layout.json` folders (`10-intent/test-cases/T397.test.mjs`, `11-requirements/test-cases/T398.test.mjs`, `12-architecture/test-cases/T399.test.mjs`, `11-requirements/test-cases/T400.test.mjs`, `14-operations/controls/CTL1-verify-case/T401.test.mjs`). Each planned Case's `run()` was executed on this PLAN tree (5/5 behavioural RED), checked for discovery via `kaal-testing/cases` (`collectCases`) and execution boundary against `engineering/cases/cases.test.mjs` (plus prior CI run `44965325563` when they sat under `01-changes/`), and executed against a disposable scratch DO copy (`KAAL_TESTING_DIR`) placing the five drafted files into `package-layout.json` folders (5/5 GREEN in place without moving or renaming). Layout conformance was checked via `judgeLayout` (`packages/kaal-engineering/skills/kaal-engineering/scripts/check-layout.mjs`).

## 1. RED Result on This PLAN Tree (`T397.test.mjs`–`T401.test.mjs` in `10-`..`14-`)

| Case | Tests | Observed Result on PLAN Tree |
| --- | --- | --- |
| `testing/T397` | `testing/I48` | `RED`: `I48.md is absent` |
| `testing/T398` | `testing/F173` | `RED`: `F173.md is absent` |
| `testing/T399` | `testing/A59`, `testing/F173` | `RED`: `A59.md is absent` |
| `testing/T400` | `testing/F173` | `RED`: `judge-verify-case.mjs is absent` |
| `testing/T401` | `testing/CTL1` | `RED`: `CTL1.md is absent` |

Summary: **5 RED-observed, 0 GREEN, 0 syntax/import errors.**

## 2. Case Discovery and Execution Lifecycle

- **`kaal-testing/cases` (`collectCases('engineering/testing')`):** Discovers all 5 Cases (`10-intent/test-cases/T397.test.mjs`, `11-requirements/test-cases/T398.test.mjs`, `12-architecture/test-cases/T399.test.mjs`, `11-requirements/test-cases/T400.test.mjs`, `14-operations/controls/CTL1-verify-case/T401.test.mjs`) cleanly with `parked: false` and `findings: []`.
- **Separating discovery from mandatory green CI during PLAN (**`C30` precedent: `#2316` -> `#2318`**):**
  - `engineering/cases/cases.test.mjs` has no expected-RED handling and scans only `/^0[0-6]-/` (`await loaded.run()` runs every discovered `0[0-6]-` Case as a required green check in `Engineering` and `Workspaces` via `pull/T34` and `pull/T37`).
  - When `T397.test.mjs`–`T401.test.mjs` were placed under `01-changes/C80-verify-case/` at `8b872943`, CI run `44965325563` failed `Engineering` (650 pass, 6 fail: `testing/T397`–`testing/T401` RED as expected + `pull/T34`) and `Workspaces` (`@kaihacksai/kaal-release`: `pull/T37`), while all 30+ other checks passed.
  - Following `C30` (`#2316` PLAN -> `#2318` DO), placing the five plain `.test.mjs` Cases directly in their destination `package-layout.json` folders (`10-`..`14-`) keeps them present and discoverable by `collectCases` (`parked: false`) and demonstrably 5/5 RED on PLAN, without triggering the green-required `0[0-6]-` runner (`cases.test.mjs`) before DO delivers `I48.md`, `F173.md`, `A59.md`, `CTL1.md`, and `judge-verify-case.mjs`.
  - **In DO (`C80`):** The exact same 5 `.test.mjs` files in `10-intent/test-cases/`..`14-operations/controls/CTL1-verify-case/` turn GREEN in place without moving or renaming; Prerequisite #4 tracks wiring `10-`..`15-` execution into `engineering/cases/cases.test.mjs` / `kaal-testing run` so deployed post-DO Cases also execute in CI.

## 3. Throwaway DO Verification & Layout Conformance

With the five drafts from `interface.md` placed at `10-intent/I48-cases-are-well-formed/I48.md`, `11-requirements/F173-verify-case/F173.md`, `12-architecture/A59-judge-verify-case/A59.md`, `13-source/scripts/judge-verify-case.mjs` (plus `13-source/unit-tests/`), and `14-operations/controls/CTL1-verify-case/CTL1.md`, and the `.test.mjs` Cases moved (not renamed) into `10-intent/test-cases/`, `11-requirements/test-cases/`, `12-architecture/test-cases/`, and `14-operations/controls/CTL1-verify-case/` in a disposable scratch copy:

- `testing/T397`–`testing/T401`: **5/5 GREEN** (including negative assertions for incomplete `case-form@1` reports missing `catalog`/`targets` or `'true'`/`false`, malformed/wildcard/non-exemptible `subjectPolicy` returning `invalid-policy` `UNKNOWN`, `FAIL` outranking `UNKNOWN`, and `find-controls.mjs` / `check-controls.mjs` reporting `testing/CTL1 designed valid` with `refused: []`).
- **`judgeLayout` on PLAN tree:** `{"verdict":"PASS","findings":[]}`
- **`judgeLayout` on throwaway DO tree:** `{"verdict":"PASS","findings":[]}`

## 4. Independently Reproduced Real-Tree Classification (`origin/main` at `4a244cb3`)

*Context:* During PR #2308 review, the CTO reported running the superseded regex draft on an earlier `main` snapshot (`275` of `581` Case files: `159 unknown-subject` across `121` distinct targets, `114 stale-header`, `2 missing-id`, `2 unattributed-case`). Below is our **independently reproduced** read-only classification on `origin/main` (`4a244cb3`) using `kaal-testing/cases` (`collectCases` + `readCase`):

| Class (`4a244cb3`, 581 tracked `T<n>.(red\|test).mjs` files) | Count | Classification | Routing / Policy |
| --- | --- | --- | --- |
| **Cataloged vs. `no-id` (`readCase`)** | `579` cataloged, **`2` `no-id`** (`T1239.test.mjs`, `T1240.test.mjs` in `packages/kaal-engineering/02-requirements/F55-core-in-engineering/`) | **Genuine structural defect** (`export const id` and `export const tests` omitted; line-1 header present) | Real `FAIL` (`kaal-engineering` owner). |
| **`duplicate-id` / `multi-id` / `malformed-attribution` / `missing-run`** | **`0`** | Clean across all 581 files | None. |
| **Targets absent from YAML frontmatter `id:` only** | **`135` distinct targets** (`185` file-target occurrences: `5` Changes / `38` files, `5` Defects / `8` files, `55` Goals / `57` files, `70` prose/bullet specs / `82` files; **`0` unmentioned in `.md`**) | **Incomplete subject resolver false failures** (all `135` targets exist in Change, Defect, Goal, or prose `.md` specs) | Must classify as **`unverified-target` (`UNKNOWN`)** until an authoritative resolver supports all subject kinds — never false `FAIL`. |
| **Line-1 header vs. export differences** | **`205` total:** `53` trailing `.`/prose allowed by `testing/F152`; `141` legacy unqualified Goal targets (`G38` vs `release/G38`); **`9` genuine copy-paste/target mismatches** (`T1265`, `T1266`, `T870`–`T873`, `T533`, `T1333`, `T1334`); `2` missing exports (`T1239`, `T1240`) | `53` valid per `testing/F152`; `141` legacy form; **`9` genuine stale headers** + `2` missing exports | Respect `testing/F152` trailing prose rule; list the `141` legacy Goal headers explicitly in `subjectPolicy.exempt` with exact file + reason; route the `9` genuine mismatches (`release`, `controls`, `engineering`) and `2` missing exports (`engineering`) as real `FAIL`s. |

## 5. What This Shows and Does Not Show

- **Shows:** All five `C80` Cases (`T397.test.mjs`–`T401.test.mjs`) sit in their destination `package-layout.json` folders (`10-`..`14-`) per the `C30` precedent (`#2316` -> `#2318`), are verified 5/5 RED on this PLAN tree, are discovered cleanly as unparked `.test.mjs` Cases by `collectCases`, pass 5/5 in the throwaway DO tree in place (`judgeLayout` `PASS`), and remain outside the green-only `0[0-6]-` runner until DO while the contextual Control fails closed on incomplete `case-form@1` reports and invalid/wildcard exemption policies and preserves checker uncertainty (`unverified-target` → `UNKNOWN`).
- **Does not show:** That Hosting's AST source inspection, `testing/C74`'s `readCase` upgrade, `testing/C69`'s amended `lib/form.mjs`, or phase-aware/layout-aware Case execution are implemented yet (those remain ordered prerequisites), that `verify Case` has run in CI or as a pre-push githook, or that any `fixture:2`, `real:1`, or `provoked:1:fail` evidence records exist (`testing/CTL1` stays `detective` and `designed`).
