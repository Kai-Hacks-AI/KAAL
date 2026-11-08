# Loops as a Graph: Intent

This is `testing/C56` (number provisional), a PLAN Change. It ships no code, test, export or package, and changes no other capability's contract. It answers the Owner's direction of 8 November 2026 on how Defects and RED Cases are handled across the test loops.

**What is missing.** Cases already trace to their targets (testing/C48 derives `tests →` from a title's brackets) and a Defect record already has its evidence rules (testing/C54, testing/F98–testing/F101). Three things are not stated anywhere:
- which **loop** a Case belongs to, and a proof that its trace goes outward;
- how a **Defect** relates to the Requirement it reveals, and how "answered" is computed from the whole chain and not from one Case;
- how Testing **composes Plans** from that structure (per loop, per Change, RED, promotion), so that CI can count open REDs and guard against regression without a hand-run file that no suite names.

Today a Hosting Defect has a record and a hand-run `.red.mjs` in `06-defects/`. RED is shown by hand on the parent commit. Nothing runs the file afterwards.

**What exists, and what this Change does not repeat.**
- testing/F84–testing/F88 (testing/C48): the Case declares its targets in its title's brackets; `derive`, `edges`, `incoming` and `impact` give the `tests →` relationship both ways, and `unknown` fails closed.
- testing/C14 (model): Strategy, Plan, Suite and Case kinds, Runs and Case Results, "no mandatory universal tree or schema" (Owner, 28 October).
- testing/C54 (defect-record): the record, its three statuses and the evidence each needs; the accepted-defect ratchet is an open question there and stays open here.
- testing/C4 (red): a skipped or `todo` test is RED and is reported (testing/I1, testing/F2); FAR is Change's composition of ordinary Plans.
- testing/C50 (composed-plan): one execution of explicit `node:test` files shared by several Suites.

**The model, as the Owner set it.** Items are nested: Intent, then Requirements (functional and nonfunctional), then Architecture, then Code. A Defect sits next to Requirements, is its own Node, and reveals a missing or wrong Requirement; the fix adds or amends that Requirement and closes the Defect. Items are kaal-graph Nodes, and their YAML frontmatter makes them computable. A Test Case points only at its item. Testing owns the mechanism; the consuming package owns the specifics, including how many loops it has, what they are called and their order.

- **testing/I29**: A consumer declares its own loops, their names and their order, and Testing works with whatever depth it declares. Testing prescribes no fixed set of loops.
- **testing/I30**: A Case points only at its item. That the Case sits in the right loop, and that every trace between items goes outward, is proven from the declaration, the Case's location and the Edges, never asserted by hand.
- **testing/I31**: A Defect is its own Node. It is answered when the Requirement it reveals exists and the chain below it, down to code, is evidenced GREEN: a computed fact, not a status word.
- **testing/I32**: Testing composes Plans from this structure: per loop, per Change, RED, and promotion. A RED Case is an ordinary Case playing a role. Testing inverts the role in the Plan and keeps the Case failed and visible in the Run.
- **testing/I33**: Test Cases sit in their context, next to the item they prove, and the folder is the loop. Suites are not stored beside Cases: they are collected from the Cases the context folders define. Building a suite is an art, so it is a Testing Skill capability, computed where the graph decides it and judged where it does not.

**Why this supersedes one reasoning of testing/C48.** C48 derived `tests →` from titles because the targets were bullets in Markdown, not Nodes. The Owner has decided that items become Nodes. The Case side stays derived, since a test file is not a Node, and its identity is its title plus its location. Where an item is not yet a Node, the existing derivation stands and the proof of that Edge is `unknown`.
