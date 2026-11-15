# Case Ownership: Architecture

Each element names, in brackets, the Requirements it answers.

- **testing/A48** [testing/F134, testing/F135, testing/F136, testing/F137, testing/N29]: A survey under `plan/case-ownership/survey/` with three records: `survey.json` (the scope and every Case with its declared links, status, reason and file hash), `judgments.json` (one owner judgment for each owned node) and `investigations.json` (one investigation for each unresolved Case). Its Cases are `test/plan/case-ownership/T360` to `T362`, run by `test/plan/case-ownership.test.mjs` once GREEN. The read-only helper `test/plan/case-ownership/lib.mjs` recomputes the survey. Nothing in `lib/`, `capability/`, `payload/` or `skills/` changes.

## What owns what

| Concern | Owns |
| --- | --- |
| Intent, Requirements, Architecture, Defect (the owning node) | its claims, the Cases that verify them, and the judgment of whether those Cases are enough |
| The concerns an unresolved Case may involve | the judgment of which node or link is missing, and the later Change that adds it |
| Testing, by the Script | the declared links, identities and consistency of the survey and its records, and the shared mechanics of Case structure, execution, traceability and evidence |
| Testing, by the Skill | how to design a Case for a claim, as in `testing/C59`. Not another concern's adequacy |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `testing/C61` PLAN, this Change | Testing | `testing/C60`, on main |
| `testing/C62` DO: the survey, with the owners' judgments and the investigations, T360 to T362 GREEN | Testing, with the owning concerns' judgments | `testing/C61` |
| Changes that add a missing node or link, or move a Case | the owning concern | `testing/C62` |
