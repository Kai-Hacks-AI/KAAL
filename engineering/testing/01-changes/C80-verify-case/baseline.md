# C80 baseline

The baseline is `origin/main` at `4a244cb3` (after `testing/C74` hold-adapter `#2291`, `testing/C75`–`C77` seeded-properties `#2296`, and `testing/C78`–`C79` act-library-sensitivity `#2264`).

## 1. Existing Case Readers and Known Limitations on `origin/main`

- **`packages/kaal-testing/lib/cases.mjs` (`testing/C74`, `readCase` / `collectCases`):** Landed on `origin/main`. `collectCases` walks via Hosting (`list` with `links: 'skip'`) and reports `no-id` and `duplicate-id`. `readCase(text)` uses `/^export const id = (['"])([^'"]+)\1/gm` and `/^export const tests = \[([^\]]*)\]/m`:
  - **Strength:** Accepts both quote forms and trailing comments (`export const id = 'x/T1'; // note`).
  - **Current lexical limitations (must be solved upstream via Hosting shared inspection + C74 adapter upgrade, NOT duplicated in C80):** Line-anchored regexes still match inside unindented template strings and block comments; `strings(...)` silently discards non-literal entries in `tests` instead of reporting malformed attribution; `readCase` does not yet inspect `run` (neither presence nor callable-function check).
- **`testing/C69` (`kaal/testing/well-formed-cases`, unpromoted PLAN):** Defines `lib/form.mjs` (`kaal-testing/form`, `case-form@1`) consuming `readCase` (`testing/F163`, `testing/F164`) without adding a second parser (`testing/A52`).
- **`engineering/cases/cases.test.mjs`:** Discovers `engineering/<scope>/0[0-6]-*/**/T<n>.test.mjs` (matching `01-changes/` too) and checks `id` and `typeof run === 'function'`, without checking `export const tests` or subject existence.
- **`packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs`:** Reads only line-1 `// Case <id> tests: ...` comments, which diverge when stale.
- **`packages/kaal-hosting` (`conformance.ts`, `couplings.ts`):** Already uses `es-module-lexer` and `typescript` for AST/lexical inspection, making Hosting the natural owner of shared source inspection.

## 2. Real-Tree Classification on `origin/main` (`4a244cb3`)

To prevent false `FAIL`s before rollout, we ran an independent read-only scan across all **581** tracked `T<n>.(red|test).mjs` files on `origin/main` (`4a244cb3`) using `kaal-testing/cases` (`collectCases` + `readCase`), comparing line-1 headers, exports, `run` declarations, and target resolution against `.md` frontmatter `id:`:

- *(Note: Earlier CTO review on PR #2308 reported `275/581` findings against an earlier `main` snapshot using the superseded regex draft: `159 unknown-subject` across 121 targets, `114 stale-header`, `2 missing-id`, `2 unattributed-case`. Those counts are kept distinct from our independent reproduction below.)*

| Finding class (reproduced on `4a244cb3`) | Files / Targets | Classification & Root Cause | Disposition in `C80` |
| --- | --- | --- | --- |
| **`no-id` + `absent-attribution`** (`missing-id`, missing `export const tests`) | **2 files** (`T1239.test.mjs`, `T1240.test.mjs` in `packages/kaal-engineering/02-requirements/F55-core-in-engineering/`) | **Genuine structural defect** (line-1 header names `engineering/F55`, `run` exported, `export const id` & `export const tests` omitted). | Real `FAIL` routed to `kaal-engineering` owner. |
| **`duplicate-id` / `multi-id` / `malformed-attribution` / `missing-run`** | **0 files** | Clean across all 581 files on `4a244cb3`. | Verified clean. |
| **Targets absent from YAML frontmatter `id:` only** (`135` distinct targets, `185` occurrences) | `5` Changes (`38` files), `5` Defects (`8` files), `55` Goals (`57` files), `70` Requirements/Arch/Intent defined as prose/bullets (`82` files); **0** unmentioned in `.md` | **False `FAIL` caused by incomplete subject collector** (frontmatter-only scan misses Changes, Defects, Goals, fenced drafts, and inline `**ns/F<n>**` specs). | Classified as **`unverified-target` (`UNKNOWN`)** until an authoritative subject resolver covers all valid subject kinds — never false `FAIL`. |
| **Header vs. export mismatch** (`205` files total) | **141** legacy unqualified Goal targets (`G38` vs `release/G38`); **53** trailing `.`/prose allowed by `testing/F152`; **9** genuine copy-paste/target drift (`T1265`, `T1266`, `T870`–`T873`, `T533`, `T1333`, `T1334`); **2** missing exports (`T1239`, `T1240`) | **Mixed:** `53` trailing-prose headers are valid per `testing/F152` (parser artifact); `141` unqualified Goals are legacy forms; **`9` are genuine stale headers** (owners: release, controls, engineering). | Follow `testing/F152` (`optionally followed by '.' and free text`), mark legacy Goal headers explicitly in `subjectPolicy`, and surface the `9` genuine mismatches as `FAIL`. |

## 3. Highest `testing/*` IDs Checked

Across `origin/main` (`4a244cb3`), `testing/rt3-act`, and `origin/kaal/testing/act-library-sensitivity`: `testing/C79`, `testing/I47`, `testing/F172`, `testing/A58`, `testing/T396`, no `testing/CTL*`. This PLAN uses `testing/C80`, `testing/I48`, `testing/F173`, `testing/A59`, `testing/CTL1`, and `testing/T397`–`testing/T401`.
