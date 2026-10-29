# Optional Composition with Requirements: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **architecture/N3** [architecture/I4]: The package keeps no dependency, peer dependency or optional dependency on `kaal-requirements`, and names no version of it. `architecture/N1` stays as it is.
- **architecture/N4** [architecture/I4, architecture/I6]: Nothing Architecture ships fails, refuses to install or stops verifying because Requirements is absent, at another version, or removed.

## Functional

- **architecture/F7** [architecture/I5]: Architecture provides one relationship Definition, `Placement`, typed by Core's `KAAL Definition`. It states that a decision places the behaviour its targets ask for, and that the relationship transfers no ownership: a target keeps its own meaning, and Architecture's reading of it is its own.
- **architecture/F8** [architecture/I5]: A decision recorded as a Node names what it answers as Graph Edges of type `Placement`, each target by the name and id it had when cited. The Edges go out from Architecture's decision, so Architecture owns them. Requirements reads them without owning them.
- **architecture/F9** [architecture/I4, architecture/I5]: The Agent Skill says how to work in each state. With no Requirements, it grounds a decision on the need as stated, as today. With Requirements in the Engine, it also cites the Requirements a decision answers and names any placement that answers none. It never treats Requirements' absence as an error.
- **architecture/F10** [architecture/I6]: The Agent Skill states what a citation means when its target cannot be resolved. If no Node by that name is present, the citation is retained: it is still evidence of what was decided and why, but it is not re-checkable. If a Node by that name is present with another id, the citation is of an earlier version. Either way the decision keeps its Edge and says how current it is. It is not deleted, rewritten or treated as false.
- **architecture/F11** [architecture/I5]: The Node `Architecture` adds one sentence: it may name the Requirements a decision answers, and naming one transfers no ownership.
