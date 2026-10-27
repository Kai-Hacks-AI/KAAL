# Capability Registration and One-Way Traceability: Architecture

Each element names, in brackets, the Requirements it answers.

- **core/A25** [core/F47, core/N15]: A registration is a typed artifact (`core/C9`) of Core's Type `Registration`.
  - **Where it lives.** A Capability ships its registration in its contribution, as it ships its Type Definitions.
  - **What it holds.** Its frontmatter holds `capability`, `namespace`, `kinds` (each kind with its `traces` rule and, if its owner declares it, `acyclic: true`) and `artifacts` (each identity with its `traces`). There is no field for incoming traces. Its body explains the registration to people and agents.
  - **What the DO Change ships.** The `Registration` Type Definition, and the Capability Node it names, ship with the DO Change. Core validates a registration's frontmatter with `core/C6`'s `validate`, and parses no YAML itself.
- **core/A26** [core/F48–core/F56, core/N14]: `kaal-core/registration` exports `assemble(registrations)`. It is pure. It returns:
  - `namespaces`, `kinds` and `artifacts`, each with its owner;
  - `findings`, `cycles` (the observed cycles, each naming its artifacts) and `untraced`;
  - `outgoing(id)`, `incoming(id)` and `reach(id)`.

  It imports no host module.
- **core/A27** [core/F53, core/F54]: **Graph represents, traverses and detects; Core enforces declarations.** Core holds the assembled artifacts and traces in Graph, and uses Graph for four things:
  - `in()` for `incoming`;
  - `traverse` for `reach`. It is already cycle-safe, deterministic and terminating: each Node is visited once, along sorted Edges, in O(V + E) (`kaal-graph` `edges.mjs`, `traverse`);
  - Graph's structural cycle detection and reporting for `cycles`;
  - `check()` for unresolved targets.

  Core keeps no edge index and no cycle detection of its own. It only compares each reported cycle with the owners' `acyclic` declarations.
  - **Stop 1.** Graph's references are `{ name, id }`, and artifact identities are names without a content id. If Graph cannot hold a trace to a name-only target, the DO Change stops and waits for a Graph Change.
  - **Stop 2.** Graph has no API that reports cycles yet. The DO Change waits for Graph's Change that adds one: deterministic, terminating on any graph, and reporting each cycle's members, as Graph designs it.

  Core builds no substitute for either.
- **core/A28** [core/F56, core/N16]: `verify` and `kaal verify` find registrations among the typed artifacts the Engine already recognizes, and report `assemble`'s result. Nothing else in Core, and nothing in Guard, imports `kaal-core/registration`.

## Ownership

| Who | Owns |
| --- | --- |
| Core | the registration contract, its Type, `assemble`, and the global verdict |
| Each Capability | its registration's content, its namespace's artifacts and their outgoing traces, and the local verdict on what they mean |
| Each kind's owner | that kind's trace rule, and whether it is `acyclic` |
| Graph | representing and traversing the assembled relationships, and detecting and reporting their cycles, deterministically and terminating on any graph |
| Guard | nothing here. It neither reads nor requires a registration. |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `core/C24` PLAN, this Change | Core | `core/C9` |
| `graph/C…`: structural cycle detection and reporting (`core/A27` Stop 2), and name-only targets if Stop 1 applies | Graph | — |
| `core/C26` DO: the `Registration` Type, `kaal-core/registration` and `verify`, with core/T50–core/T59 GREEN | Core | `core/C24`, `core/C11`, `core/C6`, `graph/C…` |
| Registrations of the kinds and their rules: I (Intent), F, N and D (Requirements), A (Architecture), T (Testing), C (Change, with no outgoing rule) | each kind's owner | `core/C26` |
| The registration of the `Code` kind | the Capability that defines Code, which no Capability has claimed yet | `core/C26` |
| Each Capability's registration of its own namespace and artifacts | that Capability | `core/C26` and the kinds it uses |

Related work is referenced, not moved:
- Testing's identities `<capability>/T<n>` (`testing/N2`, #385) are the first `T` instances.
- Engineering's RATS (#285) keeps the steering of Requirements, Architecture and Testing.

Aligning `core/C9`'s Type prefixes with namespace claims is a later decision. `core/C25` is the README release-status Change (#512).
