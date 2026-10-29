# Project map: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **project/N1** [project/I5]: Every function is pure and deterministic.
  - It reads nothing from the host and writes nothing.
  - It does not read the clock.
  - It never changes its input.
  - Its output depends only on the content of its input, not on the order in which plans, Changes or relations are given.
- **project/N2** [project/I3, project/I4]: Project's map imports no other capability's package. Change's facts reach it only as data, through Change's exchange that a consumer passes in (project/F3).

## Functional

- **project/F1** [project/I1]: A Project Plan, as the map reads it, is `{ project, outcome, warrant, changes, grouping, sequencing }`.
  - `project` is the Project's identity, and `changes` holds the governed Normal Changes' identities, `<namespace>/C<n>`.
  - `grouping` is a list of groups, each a list of at least two governed Changes that must land together.
  - `sequencing` is a list of `{ before, after }` pairs of governed Changes, which is Project's own coordination order.
  - A member that names a Change the Plan does not govern, an empty or single-member group, or a missing or malformed member is a finding naming it.
  - A Plan member that states a relation between Changes that is Change's, such as `succeeds`, `dependsOn` or `dependencies`, is a finding: Succeeds is Change's (project/I2).
- **project/F2** [project/I4]: Project's map contract, owned by Project, is `{ nodes, relations, findings }`. It is not a shared or universal contract (project/A2).
  - **A node** is `{ identity, kind, owner, resolved }`. `kind` is `project`, owned by `Project`, or `change`, a Change identity owned by `Change`. A `project` node is always resolved. A resolved `change` node also carries Change's content `id`, as the exchange gives it. The key is `identity`, never `id`, because in Graph and Change `id` is the content id.
  - **A relation** is `{ from, to, relation, source }`, with `from` and `to` identities. `relation` is its qualified identity `{ name, owner }`. `source` is its provenance: the Project identity for Project's relations, and the succeeding Change's content `id` for a consumed Succeeds, so that it pins the exact bytes the relation was read from.
  - **A finding** is `{ owner, … }`. Project's own are `{ owner: "Project", finding }`, with the finding as text. Change's pass through unchanged as `{ owner: "Change", kind, change, … }`. Neither is flattened into the other.
  - **Project's own relations** are exactly `governs`, `grouped with` and `before`, each owned by `Project`. Project defines no relation of any other capability, and enumerates no closed vocabulary beyond its own.
  - Nodes are sorted by `identity`. Relations are sorted by `from`, `to`, then the relation's owner and name. Findings are sorted by owner, then by their canonical JSON text.
- **project/F3** [project/I1, project/I2, project/I3]: `map(plans, { changes })` gives Project's map.
  - For each Plan it gives a `project` node, a `governs` relation to each governed Change, a `grouped with` relation between each ordered pair in a group, and a `before` relation for each sequencing pair. All of these are owned by `Project`.
  - `changes`, when given, is Change's exchange as a consumer passes it, plain data as in change/F13 (#530): `{ changes: [{ identity, id, succeeds: [identity], … }], findings: [{ kind, change, … }] }`. A governed Change listed in `changes` is `resolved: true` and carries its `id`. For each governed Change, each identity in its `succeeds` (direct only) that the Plans also govern gives a relation `{ name: "Succeeds", owner: "Change" }`, from the succeeding Change to its predecessor, with the succeeding Change's `id` as `source`. Its other members, `delivers`, `requires` and the delivery status present when a consumer passed Testing's evidence, are Change's, and this map does not consume them. Each of Change's findings whose `change` is a governed Change passes through as Change's. Project neither reinterprets nor extends any of it.
  - When `changes` is absent, every governed Change is `resolved: false`, and no relation or finding owned by Change is given.
  - A governed Change that a given `changes` does not list is `resolved: false`, with a finding of Project's naming it.
  - Project never gives a relation owned by Project that states a delivery prerequisite: its `before` is coordination order, never Succeeds.
- **project/F4** [project/I5]: `render(map)` gives the Markdown tree.
  - Each Project is a top-level line `- <project>`, Projects by id. Its governed Changes follow as indented lines `  - <change>`, with ` (unresolved)` appended when unresolved. They are in a stable topological order of its `before` relations: among the Changes whose predecessors are already listed, the smallest id comes first.
  - Beneath a Change, one indented line per relation from it, ordered by owner, then name, then target: `    - <name> <to> (<owner>)`. `governs` relations are the tree itself and are not repeated.
  - The output ends with one newline. Findings are rendered after the trees in their sorted order: Project's as `! <finding>`, Change's as `! <kind> <change> (Change)`.
