# Change Nodes and Their Dependencies: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **change/N1** [change/I4]: Assessment is deterministic and pure.
  - The same Nodes give the same result, in any order.
  - It reads nothing from the host and writes nothing.
  - Nodes that are not Changes are ignored, and no Change Nodes give an empty result with no findings.
- **change/N2** [change/I2]: A dependency is stated once, in the Node of the dependent Change. There is no field for a dependent, and the reverse of a dependency is always computed.

## Functional: the Change Node

- **change/F1** [change/I1]: A Change Node is an ordinary Node typed by the Change Definition. Its `name` is the Change's identity.
- **change/F2** [change/I1]: An identity is `<namespace>/C<n>`, where `n` is a positive integer with no leading zero, such as `guard/C23`.
  - A Change Node with any other name is a finding naming it.
  - Two Change Nodes with one identity are a finding naming the identity, and neither is walked.
  - Who owns a namespace is not Change's to decide. That is Capability registration (`core/C24`, #518).
- **change/F3** [change/I3]: A Change Node that states `priority`, `rank`, `order` or `state` in its frontmatter is a finding naming the Change and the key.

## Functional: dependencies

- **change/F4** [change/I2]: A Change's dependencies are its Edges of the Depends On relationship, a KAAL Definition that `kaal-change` provides. Each target must be a Change Node. Otherwise it is a finding naming the source, the target and the reason:
  - **unresolved:** no Node with that id is present;
  - **stale:** the identity names a present Change of another id, because the target changed after it was pinned;
  - **not a Change:** the target is a Node of another type.
- **change/F5** [change/I2]: The views are derived from the stated Edges:
  - `has(identity)` is true only for a Change that is walked: well-formed and unique;
  - `dependsOn(identity)` lists the Changes it depends on;
  - `dependents(identity)` lists the Changes that depend on it;
  - with `{ transitive: true }`, each follows the Edges all the way.

  Each lists identities, sorted, and includes only resolved Edges.
- **change/F6** [change/I3]: The result carries no priority and no order of work beyond the Edges. Which ready Change goes first is Product's.
- **change/F12** [change/I2]: A cycle among resolved Depends On Edges is a finding naming each of its Changes, sorted, and so is a Change that depends on itself.
  - The views still terminate. Each lists a Change at most once, and never the Change it starts from.
  - Content addressing makes such a cycle unresolvable for Nodes read from their bytes (change/A4). The finding covers Nodes whose ids are asserted rather than derived.
- **change/F13** [change/I2, change/I4]: `exchange()` gives the data form of the result, plain JSON with no functions, for another capability to consume.
  - **The form.** It is `{ changes, findings }`.
    - `changes` holds one entry per walked Change, `{ identity, id, dependsOn }`, sorted by identity. `id` is its content id, and `dependsOn` lists the identities of its resolved direct dependencies, sorted.
    - `findings` holds one entry per finding, `{ kind, change, ... }`, where `kind` is `malformed`, `duplicate`, `unresolved`, `stale`, `not-a-change`, `cycle` or `held-key`. They are sorted by kind, then change, then their JSON.
  - **Absences.** A Change that is not walked, because it is malformed or its identity is duplicated, is absent from `changes`, and its finding names it in `change` and says why. A Change that was never given is simply absent, with no finding. No stale, unresolved or cycle case becomes a dependency.
  - **Provenance.** `id` is the content id of the exact Node bytes the entry was read from. A consumer cites it as the source of any relation it derives from that entry.
  - **Direct dependency.** `dependsOn` holds direct dependencies only. A transitive closure computed by a consumer is the consumer's own derivation, attributed to Change's direct statements and never presented as stated by Change.
  - **Findings.** A finding's `change` is the identity it concerns, and its other members are Change's own to define. A consumer passes them through and never reinterprets them.
  - **Determinism.** Identical Nodes, in any order, give byte-identical JSON.
