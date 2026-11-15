# Case Ownership: Requirements

Each Requirement names, in brackets, the Intent it serves. A node is defined by a Markdown `id:` line, a `# <id>` heading, or a bold `**<id>**` that opens a list item. A Case declares the nodes it verifies in `export const tests = [...]`.

## Functional

- **testing/F134** [testing/I39]: **Positive ownership, as declared.** A survey of a stated scope of at least two package folders lists every Case file of the scope. A Case is **owned** when it declares at least one node and every declared id is defined in exactly one place in the scope. One node may have several Cases, and one Case may verify several nodes. The survey is recomputed from the repository by a read-only helper and equals the recorded one.
- **testing/F135** [testing/I39]: **Unresolved, not rejected.** A Case that declares no node, or declares an id defined nowhere or in several places, is **unresolved**, with the reason. The survey knows only owned and unresolved. It never marks a Case rejected or invalid, and it assigns no owner to an unresolved Case.
- **testing/F136** [testing/I39]: **The owner judges.** For each node with owned Cases the repository holds exactly one recorded judgment of whether the Cases of that node adequately test its claim. It names the node, the Cases, the judge, the evidence, a verdict of adequate, inadequate or unknown, and the reasoning. The judge is the concern that owns the node, read from the id. Testing records no verdict for a node of another concern. A deterministic check validates the identity of the judge and the completeness of the record, never the verdict. The survey has judgments by at least two owning concerns.
- **testing/F137** [testing/I39]: **Unresolved is investigated, by judgment.** For each unresolved Case the repository holds a recorded investigation. Its outcome is one of: a node is missing, a link is missing, an existing node should own it, or none found, in which case it stays unresolved. It names whom to ask and gives the reasoning. No Case file or declared link is changed to resolve an unresolved Case. The Change that does so is the owner's, and later.

## Nonfunctional

- **testing/N29** [testing/I39]: **Boundary.** The Change adds no export, Node, Skill, workflow, ruleset, dependency or finding kind, and does not edit `skills/kaal-testing/SKILL.md`, `testing/T156` to `T160`, `plan/testability/` or any other capability's file. `testing/T160` stays GREEN. Its Cases read the repository only, and check links, identities and records, never a sentence of a Case and never a verdict. `rejectsCase`, where a trial still uses it, is a local signal and appears in no Requirement or Case of this Change.
