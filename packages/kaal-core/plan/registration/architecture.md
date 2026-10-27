# Capability Registration and One-Way Traceability: Architecture

Each element names, in brackets, the Requirements it answers.

- **core/A25** [core/F47, core/N15]: A registration is a typed artifact (`core/C9`) of Core's Type `Registration`.
  - **Where it lives.** A Capability ships its registration in its contribution, as it ships its Type Definitions.
  - **What it holds.** Its frontmatter holds `capability`, `namespace`, `kinds` (each kind with its `traces` rule) and `artifacts` (each identity with its `traces`). There is no field for incoming traces. Its body explains the registration to people and agents.
  - **What the DO Change ships.** The `Registration` Type Definition, and the Capability Node it names, ship with the DO Change. Core validates a registration's frontmatter with `core/C6`'s `validate`, and parses no YAML itself.
- **core/A26** [core/F48–core/F56, core/N14]: `kaal-core/registration` exports `assemble(registrations)`. It is pure. It returns:
  - `namespaces`, `kinds` and `artifacts`, each with its owner;
  - `findings` and `untraced`;
  - `outgoing(id)`, `incoming(id)` and `reach(id)`.

  It imports no host module.
- **core/A27** [core/F53, core/F54]: **Graph represents and traverses.** Core holds the assembled artifacts and traces in Graph, and uses Graph for three things:
  - `in()` for `incoming`;
  - `traverse` for `reach` and for finding cycles;
  - `check()` for unresolved targets.

  Core keeps no edge index of its own.
  - **Stop.** Graph's references are `{ name, id }`, and artifact identities are names without a content id. If Graph cannot hold a trace to a name-only target, the DO Change stops and waits for a Graph Change. Core builds no substitute.
- **core/A28** [core/F56, core/N16]: `verify` and `kaal verify` find registrations among the typed artifacts the Engine already recognizes, and report `assemble`'s result. Nothing else in Core, and nothing in Guard, imports `kaal-core/registration`.

## Ownership

| Who | Owns |
| --- | --- |
| Core | the registration contract, its Type, `assemble`, and the global verdict |
| Each Capability | its registration's content, its namespace's artifacts and their outgoing traces, and the local verdict on what they mean |
| Each kind's owner | that kind's trace rule |
| Graph | representing and traversing the assembled relationships |
| Guard | nothing here. It neither reads nor requires a registration. |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `core/C24` PLAN, this Change | Core | `core/C9` |
| `core/C26` DO: the `Registration` Type, `kaal-core/registration` and `verify`, with core/T50–core/T59 GREEN | Core | `core/C24`, `core/C11`, `core/C6`, a Graph Change if `core/A27` stops |
| Registrations of the kinds and their rules: I (Intent), F, N and D (Requirements), A (Architecture), T (Testing), C (Change, with no outgoing rule) | each kind's owner | `core/C26` |
| The registration of the `Code` kind | the Capability that defines Code, which no Capability has claimed yet | `core/C26` |
| Each Capability's registration of its own namespace and artifacts | that Capability | `core/C26` and the kinds it uses |

Related work is referenced, not moved:
- Testing's identities `<capability>/T<n>` (`testing/N2`, #385) are the first `T` instances.
- Engineering's RATS (#285) keeps the steering of Requirements, Architecture and Testing.

Aligning `core/C9`'s Type prefixes with namespace claims is a later decision. `core/C25` is the README release-status Change (#512).
