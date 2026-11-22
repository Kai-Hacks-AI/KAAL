# C80 evidence

## Provenance

- **Baseline:** `origin/main` at `4a244cb3` (after `testing/C74` hold-adapter `#2291`, `testing/C75`–`C77` seeded-properties `#2296`, and `testing/C78`–`C79` act-library-sensitivity `#2264`), observed on Windows (`win32`, Node `v24.20.0`).
- **Method:** At PLAN commit `8b872943`, each planned Case's `run()` (`T397.test.mjs`–`T401.test.mjs`) was executed on this PLAN tree (5/5 behavioural RED), checked for discovery via `kaal-testing/cases` (`collectCases`) and `engineering/cases/cases.test.mjs` (plus CI run `44965325563`), and executed against a disposable scratch DO copy (`KAAL_TESTING_DIR`) placing the five drafted files into `package-layout.json` folders (5/5 GREEN, without renaming `.test.mjs` files) before deferring the executable `.test.mjs` files to the DO PR per `C120` precedent. Layout conformance was checked via `judgeLayout` (`packages/kaal-engineering/skills/kaal-engineering/scripts/check-layout.mjs`).

## 1. RED Result on This PLAN Tree (`T397.test.mjs`–`T401.test.mjs`, observed at `8b872943` before DO deferral)

| Case | Tests | Observed Result on PLAN Tree |
| --- | --- | --- |
| `testing/T397` | `testing/I48` | `RED`: `I48.md is absent` |
| `testing/T398` | `testing/F173` | `RED`: `F173.md is absent` |
| `testing/T399` | `testing/A59`, `testing/F173` | `RED`: `A59.md is absent` |
| `testing/T400` | `testing/F173` | `RED`: `judge-verify-case.mjs is absent` |
| `testing/T401` | `testing/CTL1` | `RED`: `CTL1.md is absent` |

Summary: **5 RED-observed, 0 GREEN, 0 syntax/import errors.**

## 2. Case Discovery and Execution Lifecycle

- **`kaal-testing/cases` (`collectCases('engineering/testing')` at `8b872943`):** Discovered all 5 Cases (`T397.test.mjs`–`T401.test.mjs`) cleanly with `parked: false` and `findings: []`.
- **`engineering/cases/cases.test.mjs` is NOT phase-aware and is layout-bounded:**
  - `cases.test.mjs` has no expected-RED handling (`await loaded.run()` runs as an ordinary Node test, so behavioral RED assertions fail the ordinary `Engineering` suite during PLAN rather than being accounted for as expected RED).
  - On `win32` (`KAAL_CASES_ROOT` pointing at scratch `engineering/`), `cases.test.mjs` line 20 (`/\/T\d+\.test\.mjs$/`) matched 0 files (`status=0`, `tests 1 pass`); on Linux (`ubuntu-latest`), it matches `01-changes/` (`^0[0-6]-`) and fails on any RED `.test.mjs` Cases while missing Cases moved into `10-intent/`..`14-operations/` after DO.
- **Observed CI run `44965325563` on `8b872943` (repo-level deadlock on PLAN RED `.test.mjs` files):**
  - `Engineering` failed (650 pass, 6 fail): `testing/T397`–`testing/T401` (`I48.md`, `F173.md`, `A59.md`, `judge-verify-case.mjs`, `CTL1.md` absent as expected in PLAN) and `pull/T34` (`AssertionError: testing/T397 is logged but not as a success`).
  - `Workspaces` (`@kaihacksai/kaal-release`, 40 pass, 1 fail) failed on `pull/T37` (`AssertionError: pull/T34 is logged but not as a success`).
  - All 30+ other checks (`Branching`, `Change Isolation`, `Acceptance`, `Guard`, `Hosting`, `CodeQL`, `hold Act`, `demand Act`, `limit Act`, `verify Act`, and all other workspaces) passed.
- **Resolution (`C120` precedent — travel with DO, never park as `.red.mjs`):**
  - Because current `main` (`cases.test.mjs` + `pull/T34` + `pull/T37`) requires every discovered `engineering/<scope>/0[0-6]-*/**/T<n>.test.mjs` to pass, no PLAN PR can carry plain `.test.mjs` RED Cases and pass CI until prerequisite #4 lands. Following the existing `C120` precedent, `T397.test.mjs`–`T401.test.mjs` travel with the DO PR rather than being hidden/parked as `.red.mjs`.
  - **After DO (`10-intent/`..`14-operations/`):** Execute via `collectCases` (`kaal-testing/cases`) + `kaal-testing run` + `kaal-testing/observe`, alongside updating `engineering/cases/cases.test.mjs` for `10-`..`15-` layout folders.

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

- **Shows:** All five drafted `C80` Cases (`T397.test.mjs`–`T401.test.mjs`) were verified RED on the PLAN tree (`8b872943`), discovered cleanly as unparked `.test.mjs` Cases by `collectCases`, passed 5/5 in the throwaway DO tree under `package-layout.json` (`judgeLayout` `PASS`), and are deferred to travel with the DO PR per `C120` precedent because `cases.test.mjs` + `pull/T34`/`T37` on `main` are not yet phase-aware (`CI run 44965325563`), while the contextual Control fails closed on incomplete `case-form@1` reports and invalid/wildcard exemption policies and preserves checker uncertainty (`unverified-target` → `UNKNOWN`).
- **Does not show:** That Hosting's AST source inspection, `testing/C74`'s `readCase` upgrade, `testing/C69`'s amended `lib/form.mjs`, or phase-aware/layout-aware Case execution are implemented yet (those remain ordered prerequisites), that `verify Case` has run in CI or as a pre-push githook, or that any `fixture:2`, `real:1`, or `provoked:1:fail` evidence records exist (`testing/CTL1` stays `detective` and `designed`).
