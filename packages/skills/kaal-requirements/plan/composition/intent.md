# Optional Composition with Architecture: Intent

This is `requirements/C1`, a PLAN Change. It ships no code and no test file. It plans how Requirements states, documents and demonstrates what it can do better when Architecture is available, without depending on it. It follows the Owner's direction on #276 (2026-10-29). It leaves the Capability Node (#276) and the Requirement Definition (#553) as scoped. Architecture plans its own reciprocal expectations in `architecture/C8` (#588), and Requirements does not write them.

KAAL packages are independently useful peers. Requirements states what must hold, on its own. Architecture places what must hold, on its own. An agent that has both can combine their contracts for more than either alone. Neither defines the other's terms, and no package dependency, pinned pair, third integration package or central composition registry joins them.

What exists today:

| | Today | Gap |
| --- | --- | --- |
| Alone | The Capability Node says what a Requirement is and that where it is placed is Architecture's. The package has no runtime dependencies | Nothing says what Requirements does differently when Architecture is present |
| Both present | Graph, on main, lets a Node carry typed Edges to other Nodes by name and id. `in(id)` lists the Edges that reach a Node, and `check()` reports an Edge whose target is absent or has another id. `architecture/C8` plans `Placement` Edges from Architecture's decisions to the Requirements they answer | Requirements does not say how it reads them, or what "placed" and "without architectural response" mean for a Requirement |
| Removal | Nothing | Nothing says what a Requirement's placement, observed earlier, means once Architecture is gone |
| Upgrade | Each package is versioned on its own | Nothing says what a placement means once the Requirement it cited, or the decision that cited it, has another id |

- **requirements/I1.** Requirements is fully useful without Architecture, and installing, upgrading or removing Architecture never breaks it.
- **requirements/I2.** When Architecture is available, an agent can see, for each Requirement, whether Architecture has placed it and by which decision, and which Requirements have no architectural response yet. Requirements owns what must hold and its own assessment. Architecture owns placement and what a placement means.
- **requirements/I3.** A placement observed earlier stays usable after Architecture is removed or changed. It keeps its provenance, and its currency is stated as qualified: it can no longer be re-checked to the same level, but it is not discarded or treated as false. Reinstalling Architecture restores the check.
