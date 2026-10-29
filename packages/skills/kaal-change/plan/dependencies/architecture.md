# Change Nodes and Their Dependencies: Architecture

Each element names, in brackets, the Requirements it answers.

- **change/A1** [change/F1, change/F4]: The DO Change ships two things in `capability/`:
  - **The Depends On Definition**, a KAAL Definition that names the relationship.
  - **The Change Definition's statement of the Change Node.** It is typed by that Definition, named by its identity, with its dependencies as Edges.

  Change Nodes are found by content, as every Node is. Where a repository keeps them is that repository's choice, as for Change Records (#280).
- **change/A2** [change/F2–change/F6, change/F12, change/N1, change/N2]: `kaal-change/dependencies` exports `assess(nodes)`. It is pure and imports only `kaal-graph`. It returns:
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
- **change/A4** [change/F4, change/F12]: **Pinned by content.** A Graph Edge pins its target's id, which is the SHA-256 of its exact bytes.
  - **What content addressing establishes.** It holds for Change Nodes read from their bytes, as `identify()` reads them. To close a cycle, a Change would have to pin a Change that already pins it. Stating that Edge changes the first Change's bytes and so its id, which leaves the earlier Edge pinned to an id no longer present. The attempt therefore surfaces as a stale pin (change/F4), never as a resolved cycle (change/T17). This rests on SHA-256's preimage resistance, not on impossibility.
  - **What it does not establish.** Graph takes any frozen Node shaped as `identify()` returns it, and does not recompute its id. So a caller can hand `assess` Nodes whose ids are asserted rather than derived. `assess` therefore does not rely on the invariant: it reports any cycle among resolved Edges (change/F12, change/T18). Its walk terminates, which is Graph's `traverse` behaviour, and the finding is Change's dependency semantics. Change adds no rule to Graph and no trace rule to Core.
  - **What it costs.** Editing a Change Node changes its id, so every Change that depends on it is stale until it is pinned again. `assess` reports this and never repairs it.
- **Pinning is not immutability** (Owner decision 6491567974, 2026-10-29). Content-addressed pinning and an immutability policy are different things, and Change provides only the first.
  - **What Change provides.** Identity, explicit Depends On Edges, stale-reference detection and derived navigation. A pin records which exact bytes a dependent relied on. An edit to the target is never prevented, only reported as a stale pin (change/F4, change/T6).
  - **What the consumer decides.** Whether and when a particular Change Node may be edited, and how corrections are recorded, is the governance of the repository that consumes Change. Change imposes no Proposed/Accepted freeze and selects no lifecycle rule of its own.
  - **Why a consumer may freeze.** Preserving historical evidence against manipulation or retrospective rewriting is a reason for a consumer to choose immutability, for example to stop an agent rewriting accepted test evidence to manufacture success. Stale-pin findings give such a policy its evidence. Enforcing the policy is the consumer's, through its own controls.

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
| DO: the Depends On Definition, the Change Definition's statement, `kaal-change/dependencies`, with change/T1–change/T8, change/T17 and change/T18 GREEN | Change | `change/C1` |
| This repository's own Change Nodes | Change | the DO Change, and the Owner's answer on #280 for where they live |
| Guard's Change table as a derived view | Engineering | this repository's Change Nodes for Guard |
| Priority over Changes | Product | the DO Change |
