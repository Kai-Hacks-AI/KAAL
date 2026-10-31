# Case Traces: Intent

This is `testing/C48`, a PLAN Change. It ships no code. `testing/C49` turns its planned tests GREEN. It is Testing's part of prerequisite P2 of engineering/C11 (`engineering/change-isolation/traceability.md`, "Prerequisites, each its owner's").

**What is missing.** Engineering's isolation follows reverse traces from a changed element: the Requirements that cite it, the Test Cases that test those, and so on (engineering/F25). P2 asks each trace owner to make its relationship traversable, "as Edges in their source Nodes, or derived from them by their owner". Testing owns Case `tests →` (testing/N7). Today the relationship is in two places:
- the brackets of each Case's own title, such as `testing/T63 [testing/F51, testing/F25]`, which every capability already writes;
- manifests derived from them by hand or by script, such as `test/verify.json`'s `model` (`testing/C38`), or prose tables in `docs/testing.md`.

Nothing gives a traversal the relationship as data, from its source, without a manifest.

**Why derived, not Graph Edges in the Case files.** A Graph Edge references Nodes by `name` and content `id` (kaal-graph's `references/edges.md`). The targets, Requirements such as `hosting/F31`, are bullets in Markdown documents, not Nodes, and a test file is not a Node. Edges would need every Requirement to become a Node first, which is the Requirement owners' part of P2, and each edit to a Requirement would change its id and every Case's Edge to it. So Testing takes P2's second form: Testing derives the relationship from the Case's own declaration, with the same direction both ways as Graph's `out` and `in`. If Requirements become Nodes later, that is a later Testing PLAN, and this derivation is still the source.

- **testing/I22**: Each Case's `tests →` relationship is derived by Testing from the Case's own declaration in its source file, its title's brackets, and is traversable both ways, so that Engineering's reverse traceability can follow it without a text manifest. A bare identifier is its owner's, never guessed: the Case's own identity names the owner, or else the caller does from the location's ownership claim. Anything that cannot be read statically is a finding, never a trace. Testing never runs a case file to trace it.
