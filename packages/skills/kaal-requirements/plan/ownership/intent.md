# Requirements ownership: Intent

This is `requirements/C11`, a PLAN Change. It ships no code and no test file. It establishes one owning thread for the Requirements capability, maps the Requirements and traceability work that already exists across the portfolio, and says which part of it Requirements owns, which parts it coordinates, and in what order. It follows the CPO handover of 2 November 2026 and the portfolio assessment (#886, gap C2). No new capability implementation is authorized by it.

What exists today:

| | Where | State |
| --- | --- | --- |
| The capability | `kaal/requirements` (`packages/skills/kaal-requirements`, unscoped `kaal-requirements` 0.0.1): the Capability Node, the `Requirement` Definition (#276, #553) | On the collector only. Six commits ahead of, and 47 commits behind, `main`. Not on `main`, not on npm |
| Plans | `requirements/C1` composition with Architecture (#590), `C5` and `C6` packaging readiness and planned tests (#595, #603), `C10` traceable Requirements with `Serves` Edges (#741) | Merged to the collector. `requirements/T13` is deferred behind `core/C29`. No DO exists for `C10` |
| Convention in use | 24 `requirements.md` files across Core, Foundation, Guard, Hosting, Change, Testing and Engineer Skill write `**<cap>/F<n>**` and `**<cap>/N<n>**` with bracketed Intents | On `main`, written by hand. Prose, not a Graph Edge. Nothing reads it as a chain |
| Neighbours | Intent (`kaal/intent`, `intent/C1`, `C2` #748) supplies the target Nodes of `Serves`. Architecture (`kaal/architecture`, `architecture/C8` #588) supplies `Placement` Edges to Requirements. Graph (`main`) traverses. Testing (#745) and Packaging (#746) plan their own traces. Change Isolation by reverse traceability (#739, draft) consumes them | Intent and Architecture have no owning thread. Requirements had none until now |

- **requirements/I10.** Requirements has one owning thread and no parallel ones. It owns what a Requirement is, how one is identified, and the relationship `Serves` it provides. It owns no capability's Requirement instances and no other capability's trace.
- **requirements/I11.** Everything already planned for Requirements is mapped once, with its state and its blocker, so nobody plans it again or assumes it is delivered.
- **requirements/I12.** The Requirement → Intent trace and the Intent → Requirement → Architecture chain stay separate ownerships, each stated by the owner of its source. Requirements asks the Intent and Architecture owners for their side through those owners, and writes nothing in their place.
- **requirements/I13.** Requirements enters the delivery route only where it helps, and never ahead of the critical path to npm. Hosting 0.0.1, Foundation 0.0.2 and Core 0.0.1 come first.
- **requirements/I14.** The Owner's loop concept (2 November 2026): the Intent loop is answered by the Requirements loop, which is answered by the Architecture loop, which is answered by the Code loop. The Requirements loop holds **functional Requirements, nonfunctional Requirements and Defects**. A Defect is a kind of Requirement: it states what must not hold, or what failed to hold, and it answers the Intent like any other. Requirements owns all three kinds. Each loop answers the one above it, so a trace goes from the answering element to the question it answers, and Testing judges each loop's evidence.
