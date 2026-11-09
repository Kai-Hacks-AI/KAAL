# Engineering: what the Boundary Engine does not read, in two lists (PLAN)

Status: PLAN (engineering, collector `kaal/engineering-boundary-engine`). Ids provisional. It authorizes no DO beyond its own, and no promotion, version bump, SYNC, ledger entry, release dispatch or npm publication.

## Intent

Since #1308 the Boundary Engine's code detectors read syntax trees and report any file they cannot parse as unreadable, so the result is `unknown`. On this repository 36 files are in that state: `LICENSE` (10), `.gitattributes` (9), `.gitignore` (2), `CODEOWNERS` (1), the `.git` pointer (1), `.sh` (7), git hooks (3), and one YAML template that is not YAML. README.md is read because `.md` has a parser (commonmark, which scans its code blocks); `LICENSE` has no extension, so nothing can read it, and that is the wrong thing to report as a failure.

Owner ruling (9 Nov): two lists, a **global** one and **local** ones per capability, covering everything relevant and not everything. CPO-side policy (9 Nov, Owner-endorsed): applicability is defined **by detector and file type**, not by a blanket list of filenames; a file a detector does not apply to is recorded as **not applicable, with a reason**, never as inspected; a file expected to hold relevant source that fails to parse stays **unknown**; and a file extension alone must not hide a parse failure. This PLAN joins the two: applicability is the rule, and the lists carry the reasons.

Use over build: no new dependency. The lists are YAML read by the existing front matter reader.

## Requirements (provisional ids)

- **R1. Applicability by detector and file kind.** Each detector declares what it applies to. `file-identity` applies to every regular file (it compares bytes). `call-with-literal` and `token-sequence` apply to supported source syntax: JavaScript and TypeScript, and the `js` and `ts` code blocks of Markdown. JSON and YAML are parsed as data: read, and nothing for these detectors to find. Any other kind has no structural parser, so these two detectors do not apply to it. This is decided by the engine's rules, never by a file name.
- **R2. Not applicable, with a reason, visible.** A file that a definition's code detectors do not apply to is recorded in `coverage.notApplicable` as `{ path, detectors, reason }`, apart from `read` and `unreadable`, and counted in the summary line. It is never reported as inspected. The reason comes from R3 or R4 when an entry names the file, and otherwise is the default `no structural parser for this file kind`. An unsupported file does not make the result `unknown`.
- **R3. The global list.** `engineering/boundary/scope/not-applicable.md`: Markdown with YAML front matter, a list of `{ name | extension, reason }`, where a `name` is an exact file name (`LICENSE`) and an `extension` an exact extension (`.gitignore`). No glob, no regular expression. Engineering owns it, and a change is an Engineering Change with its reason. It supplies the reason for files that never hold code in any package: initial entries `LICENSE`, `.gitignore`, `.gitattributes`, `CODEOWNERS`, the `.git` pointer ("no executable content").
- **R4. Local lists.** A capability's Boundary definition may carry the same list under `not-applicable:`, saying why its tests do not cover a kind (Foundation: `.sh` and the git hook files, "Foundation's tests are JS-shaped; shell is not covered by these tests"). A local list applies only to that definition. It is not an exclusion from all Boundary Tests: another provider's tests, and `file-identity`, still see the file.
- **R5. A parse failure is never hidden.** An entry in a list is refused when it names a kind that has a parser (JS, TS, Markdown, JSON, YAML), or a name whose extension has one, or has no reason. A file of a supported kind that fails to parse (invalid JavaScript, YAML or JSON) is `unreadable` with cause `does not parse`, so the result is `unknown`, whatever a list says. The one invalid YAML template in this repository is therefore fixed or renamed, not listed.
- **R6. Bytes still count.** `file-identity` runs on every regular file, including one that is not applicable to the code detectors.
- **R7. No target and no role in a list.** Entries name file kinds, never a path inside a target and never a role.

## Testing (RED until the DO)

Engineering Cases on fixtures: R1 each detector applies to exactly its kinds; R2 an unsupported file is recorded `notApplicable` with the default reason, is not in `read`, and does not make the result `unknown`; R3 a global name or extension supplies its reason; R4 a local list applies only to its own definition and `file-identity` still sees the file; R5 the refusals, and an invalid `.yml`, `.json` or `.mjs` is `unknown` even when a list names it; R6 a byte copy inside a not-applicable file is still found; R7 an entry with a path or a role is refused.

## Order

1. This PLAN, then its DO in Engineering (not built until the Owner confirms the reconciliation).
2. Foundation: its local list in the definition (its own small Change on `kaal/foundation`).
3. The cross-collector proof point reads the report's `notApplicable` list.
