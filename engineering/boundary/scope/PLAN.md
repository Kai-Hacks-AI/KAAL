# Engineering: what the Boundary Engine does not read, in two lists (PLAN)

Status: PLAN (engineering, collector `kaal/engineering-boundary-engine`). Ids provisional. It authorizes no DO beyond its own, and no promotion, version bump, SYNC, ledger entry, release dispatch or npm publication.

## Intent

Since #1308 the Boundary Engine's code detectors read syntax trees and report any file they cannot parse as unreadable, so the result is `unknown`. On this repository 36 files are in that state: `LICENSE` (10), `.gitattributes` (9), `.gitignore` (2), `CODEOWNERS` (1), the `.git` pointer (1), `.sh` (7), git hooks (3), and one YAML template that is not YAML. README.md is read because `.md` has a parser (commonmark, which scans its code blocks); `LICENSE` has no extension, so nothing can read it. Owner ruling (9 Nov): there are two lists. A **global** list for what never holds code in any package, and **local** lists per capability. It need not cover everything, only everything relevant. The CPO's condition: an exclusion is explicit, has a reason, and stays visible in the report; unknown is never treated as success.

Use over build: no new dependency. Both lists are YAML read by the existing front matter reader.

## Requirements (provisional ids)

- **R1. The global list.** `engineering/boundary/scope/out-of-scope.md`: Markdown with YAML front matter, `out-of-scope:` a list of `{ name | extension, reason }`. A `name` is an exact file name (`LICENSE`), an `extension` an exact extension (`.gitignore`). No glob, no regular expression. Engineering owns it; a change to it is an Engineering Change with its reason. Initial entries: the five names above (no executable content).
- **R2. Local lists.** A capability's Boundary definition may carry an `out-of-scope:` list of the same shape, which names what that capability's tests do not cover and why (Foundation: `.sh` and the git hook files, "Foundation's tests are JS-shaped; shell is not covered"). A local list applies to that definition's own scan only, and never to another provider's tests.
- **R3. A local list cannot hide code.** The engine refuses a definition whose list names an extension that has a parser (JS, TS, Markdown, JSON, YAML), a name with such an extension, or an entry without a reason.
- **R4. Visible in the report.** The evidence gains `coverage.excluded`: `{ path, list: "global" | <provider>, reason }` for each excluded file, kept apart from `read` and from `unreadable`. The summary line counts them. An excluded file is not "read" and is never reported as clean.
- **R5. Completeness.** A file that is excluded no longer makes the result `unknown`. A file with no parser and on no list still does, and so does a file that does not parse (the YAML template is then fixed or listed, with a reason).
- **R6. Bytes still count.** `file-identity` compares bytes, so it still runs on an excluded file. Only the code detectors, which need a parse, skip it.
- **R7. No target and no role in a list.** Entries name file kinds, never a path in a target and never a role.

## Testing (RED until the DO)

Engineering Cases on fixtures: R1 a global name or extension excludes and is reported with its reason; R2 a local list excludes only for its own definition; R3 the refusals; R4 the `excluded` shape and the summary count; R5 an unlisted unparsed file still gives `unknown`; R6 a byte copy inside an excluded file is still found; R7 an entry with a path or a role is refused.

## Order

1. This PLAN, then its DO in Engineering.
2. Foundation: its local list in the definition (its own small Change on `kaal/foundation`).
3. The cross-collector proof point reads the report's `excluded` list.
