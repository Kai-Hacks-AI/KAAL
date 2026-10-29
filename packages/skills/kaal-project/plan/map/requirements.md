# Project map: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **project/N1** [project/I5]: Every function is pure and deterministic.
  - It reads nothing from the host and writes nothing.
  - It does not read the clock.
  - It never changes its input.
  - Its output depends only on the content of its input, not on the order in which plans, Changes or relations are given.
- **project/N2** [project/I3, project/I4]: Project's map imports no other capability's package. Change's map reaches it only as data in the shared output contract (project/F2).

## Functional

- **project/F1** [project/I1]: A Project Plan, as the map reads it, is `{ project, outcome, warrant, changes, grouping, sequencing }`.
  - `project` is the Project's identity, and `changes` holds the governed Normal Changes' identities, `<namespace>/C<n>`.
  - `grouping` is a list of groups, each a list of at least two governed Changes that must land together.
  - `sequencing` is a list of `{ before, after }` pairs of governed Changes, which is Project's own coordination order.
  - A member that names a Change the Plan does not govern, an empty or single-member group, or a missing or malformed member is a finding naming it.
  - A Plan member that states a dependency, such as `dependsOn` or `dependencies`, is a finding: Depends On is Change's (project/I2).
- **project/F2** [project/I4]: The output contract is `{ nodes, relations, findings }`.
  - **A node** is `{ id, kind, owner, resolved }`. `kind` is `project`, owned by `Project`, or `change`, owned by `Change`, whose identity it is. A `project` node is always resolved.
  - **A relation** is `{ from, to, kind, owner, source }`. `kind` is one of `governs`, `grouping`, `sequencing`, `dependency`, `priority`, `readiness` or `lifecycle`, and `owner` is the capability that states it.
  - **`source`** is the authoritative content the relation comes from: the Project identity for Project's relations, and the given value for consumed ones.
  - Nodes are sorted by `id`, relations by `from`, `to`, `kind` and `owner`, and findings by their text.
- **project/F3** [project/I1, project/I2, project/I3]: `map(plans, { changes })` gives the output contract.
  - For each Plan it gives a `project` node, a `governs` relation to each governed Change, and `grouping` and `sequencing` relations. All of these are owned by `Project`.
  - A grouping of n Changes gives a relation between each ordered pair in it.
  - `changes`, when given, is Change's map in the same contract. A governed Change it holds is `resolved: true`, and Project copies, unchanged, every `dependency` relation owned by `Change` whose ends are both governed by a given Plan, and every `lifecycle` relation owned by `Change` from a governed Change.
  - When `changes` is absent, every governed Change is `resolved: false` and no `dependency` relation is given.
  - A governed Change missing from a given `changes` is `resolved: false`, with a finding naming it.
  - Project never gives a relation of kind `dependency` owned by `Project`.
- **project/F4** [project/I5]: `render(map)` gives the Markdown tree.
  - Each Project is a top-level line `- <project>`, Projects by id. Its governed Changes follow as indented lines `  - <change>`, with ` (unresolved)` appended when unresolved. They are in a stable topological order of its sequencing: among the Changes whose predecessors are already listed, the smallest id comes first.
  - Beneath a Change, one indented line per relation from it, ordered by kind and then target: `    - depends on <to> (Change)`, `    - grouped with <to> (Project)`, `    - is <to> (Change)` for lifecycle, and `    - before <to> (Project)`. `governs` relations are the tree itself and are not repeated.
  - The output ends with one newline. Findings are rendered after the trees, each as `! <finding>`.
