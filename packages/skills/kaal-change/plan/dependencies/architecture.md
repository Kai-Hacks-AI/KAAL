# Change Nodes and Their Dependencies: Architecture

Each element names, in brackets, the Requirements it answers.

- **change/A1** [change/F1, change/F4]: The DO Change ships two things in `capability/`:
  - **The Depends On Definition**, a KAAL Definition that names the relationship.
  - **The Change Definition's statement of the Change Node.** It is typed by that Definition, named by its identity, with its dependencies as Edges.

  Change Nodes are found by content, as every Node is. Where a repository keeps them is that repository's choice, as for Change Records (#280).
- **change/A2** [change/F2–change/F6, change/N1, change/N2]: `kaal-change/dependencies` exports `assess(nodes)`. It is pure and imports only `kaal-graph`. It returns:
  - `changes`, each with its identity and id;
  - `findings`;
  - `dependsOn(identity, { transitive })` and `dependents(identity, { transitive })`.

  It imports no host module.
- **change/A3** [change/F4, change/F5]: **Graph represents and traverses.** `assess` holds the Nodes in a Graph, and uses Graph for four things:
  - `edges(dependsOn)` for the stated dependencies;
  - `in()` for dependents;
  - `traverse` for the transitive views;
  - `resolve` and `named` for unresolved and stale targets.

  Change keeps no edge index of its own.
- **change/A4** [change/F4]: **Pinned by content.** A Graph Edge pins its target's id, which is the SHA-256 of its exact bytes.
  - **No cycle can be stated.** A Change cannot pin a Change that pins it, so the dependency graph is acyclic by construction, and Change needs no cycle detection.
  - **What it costs.** Editing a Change Node changes its id, so every Change that depends on it is stale until it is pinned again. `assess` reports this and never repairs it.
  - **Open decision.** When a Change Node may still change is the Owner's, and is set out below.

## Open decision: when a Change Node may change

| Option | What it means |
| --- | --- |
| **A. Editable while Proposed, fixed once Accepted** (recommended) | A Proposed Change may be edited, and its dependents pin it again, all within planning. An Accepted Change Node never changes. A dependency found later goes to ACT and to a subsequent Change, as a planning defect does. |
| B. Always editable | Each edit re-pins every dependent, transitively, and every re-pin is a Change of its own. |
| C. References by identity alone | This would avoid re-pinning, but Graph has no name-only reference (#352). It would need a Graph Change, and this PLAN does not propose one. |

The tests are the same under A and B. Both report a stale pin, and the policy decides only whether a stale pin may arise after acceptance.

## Ownership

| Who | Owns |
| --- | --- |
| Change | the Change Node, the Depends On relationship, `assess`, and the findings about them |
| Graph | representing and traversing Edges |
| Core | admission, and through Capability registration (`core/C24`), who owns a namespace. Change's kind `C` keeps no outgoing trace rule there, and Depends On is not a trace. |
| Product | priority. It may point to Changes with an Edge type of its own. |
| Engineering | Branching and `engineering/guard/change.md`. That table can become a view derived from Guard's Change Nodes in a Change of Engineering's own. |
| Testing | its FAR outcome refers to a Change by the same identity `<capability>/C<n>` (#385). |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `change/C1` PLAN, this Change | Change | nothing |
| DO: the Depends On Definition, the Change Definition's statement, `kaal-change/dependencies`, with change/T1–change/T8 GREEN | Change | `change/C1`, and the Owner's decision above |
| This repository's own Change Nodes | Change | the DO Change, and the Owner's answer on #280 for where they live |
| Guard's Change table as a derived view | Engineering | this repository's Change Nodes for Guard |
| Priority over Changes | Product | the DO Change |
