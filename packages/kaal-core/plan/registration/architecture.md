# Capability Registration and One-Way Traceability: Architecture

Each element names, in brackets, the Requirements it answers.

- **core/A25** [core/F47, core/F48, core/N15]: A registration is a typed artifact (`core/C9`) of Core's Type `Registration`.
  - **Where it lives.** A holder ships its registration with its content: a Capability in its contribution, as it ships its Type Definitions, and a consuming repository beside its own content.
  - **What it holds.** Its frontmatter holds:
    - `holder` and `scope`;
    - `kinds`, each kind with its `traces` rule, a list of kind names or `any`, and, if its owner declares it, `acyclic: true`;
    - `instances`, each with its `id`, its `kind` and its `traces`. A trace target is an `id` in the holder's own scope, or a `{ scope, id }` pair.

    There is no field for incoming traces. Its body explains the registration to people and agents.
  - **What the DO Change ships.** The `Registration` Type Definition, and the Capability Node it names, ship with the DO Change. Core validates a registration's frontmatter with `core/C6`'s `validate`, and parses no YAML itself.
- **core/A26** [core/F48–core/F56, core/N14]: `kaal-core/registration` exports `assemble(registrations)`. It is pure. It returns:
  - `scopes`, `kinds` and `instances`, each with its holder or owner. Each instance carries its `scope`, `id` and stated `kind`;
  - `findings`, `cycles` (the observed cycles, each naming its instances) and `untraced`;
  - `outgoing(scope, id)`, `incoming(scope, id)` and `reach(scope, id)`.

  It imports no host module. It compares scopes, identities and kind names only for equality.
- **core/A27** [core/F53, core/F54]: **Graph represents, traverses and detects; Core enforces declarations.**
  - Core gives Graph the resolved traces as successors keyed by assembly identity.
  - It uses Graph's `reach`, `reverse` and `cycles` (`graph/C2`, #562) for `reach`, `incoming` and `cycles`. Graph's functions take any string identities, so artifact identities need no content id.
  - Core keeps no edge index and no cycle detection of its own. It only compares each reported cycle with the owners' `acyclic` declarations. Resolving a target is Core's (`core/F52`).
  - The DO Change waits for `graph/C3`, the DO of `graph/C2`, on `main`. Core builds no substitute.
- **core/A28** [core/F56, core/N16]: `verify` and `kaal verify` find registrations among the typed artifacts the Engine already recognizes, and report `assemble`'s result. Nothing else in Core, and nothing in Guard, imports `kaal-core/registration`.

## Ownership

| Who | Owns |
| --- | --- |
| Core | the registration contract, its Type, `assemble`, the assembly identity, and the global verdict |
| Each kind's owner | what its kind means, what its identities look like, its outgoing rule, and whether the kind is `acyclic` |
| Each holder, a Capability or a consuming repository | its scope, its instances' content and identities, their outgoing traces, and the local verdict on what they mean |
| Graph | representing and traversing the assembled relationships, and detecting and reporting their cycles, deterministically and terminating on any graph |
| Guard | nothing here. It neither reads nor requires a registration. |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `core/C24` PLAN, this Change | Core | `core/C9` |
| `graph/C2` PLAN (#562) and `graph/C3` DO: structural reach, reverse and cycles on any string identities | Graph | — |
| `core/C26` DO: the `Registration` Type, `kaal-core/registration` and `verify`, with core/T50–core/T59 GREEN | Core | `core/C24`, `core/C11`, `core/C6`, `graph/C3` |
| Each kind's definition, with its rule and any `acyclic` declaration | that kind's owner | `core/C26` |
| Each holder's registration of its scope and instances | that holder | `core/C26` and the kinds it uses |

Which kinds exist, and which rules they register, are their owners' decisions. This PLAN prescribes none. Its tests use fixture kinds only.

Related work is referenced, not moved:
- Testing's identities `<capability>/T<n>` (`testing/N2`, #385) are Testing's own grammar for its kind, judged by Testing.
- Engineering's RATS (#285) keeps the steering of Requirements, Architecture and Testing.

Aligning `core/C9`'s Type prefixes with scope claims is a later decision. `core/C25` is the README release-status Change (#512).
