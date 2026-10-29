# Optional Composition with Requirements: Intent

This is `architecture/C8`, a PLAN Change. It ships no code and no test file. It plans how Architecture states, documents and demonstrates what it can do better when Requirements is available, without depending on it. It follows the Owner's direction on #485 (2026-10-29). It leaves `architecture/C5`'s DO, Installation Contract and tests as scoped. Requirements plans its own reciprocal expectations in its own PLAN, and Architecture does not write them.

KAAL packages are independently useful peers. Architecture describes, assesses and explains architecture on its own. Requirements states what must hold, on its own. An agent that has both can combine their contracts for more than either alone. Neither defines the other's terms, and no package dependency, pinned pair, third integration package or central composition registry joins them.

What exists today:

| | Today | Gap |
| --- | --- | --- |
| Alone | The Node bounds Architecture against Requirements (`architecture/F4`). The Agent Skill makes and grounds a decision with URBAN, and the package has no dependencies (`architecture/N1`) | Nothing says what Architecture does differently when Requirements is present |
| Both present | Graph, on main, lets a Node carry typed Edges to other Nodes by name and id, and reports an Edge whose target is absent or has another id (`check()`) | Architecture defines no relationship by which a decision names what it answers |
| Removal | Nothing | Nothing says what happens to a decision that cited a Requirement once Requirements is gone |
| Upgrade | Each package is versioned on its own | Nothing says what a citation of an earlier Requirement means after either package is upgraded |

- **architecture/I4.** Architecture is fully useful without Requirements, and installing, upgrading or removing Requirements never breaks it.
- **architecture/I5.** When Requirements is available, an architectural decision can name the Requirements it answers. An agent can then explain a placement by what must hold, and see which placements answer no Requirement. Architecture owns placement and what a placement means. Requirements owns what must hold.
- **architecture/I6.** What a decision recorded stays usable after Requirements is removed or changed. It keeps its provenance, and its currency is stated as qualified: Architecture can no longer re-check it to the same level, but it does not discard it. Reinstalling Requirements restores the stronger check.
