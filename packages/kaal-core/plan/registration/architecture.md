# Capability Registration and One-Way Traceability: Architecture

Each element names, in brackets, the Requirements it answers.

- **core/A25** [core/F47, core/F48, core/N15]: A registration is a typed artifact (`core/C9`) of Core's Type `Registration`.
  - **Where it lives.** A holder ships its registration with its content: a Capability in its contribution, as it ships its Type Definitions, and a consuming repository beside its own content.
  - **What it holds.** Its frontmatter holds:
    - `holder` and `scope`;
    - `kinds`, each kind named in the holder's scope, with its `traces` rule, a list of kind references or `any`, and, if its owner declares it, `acyclic: true`;
    - `instances`, each with its `id`, its `kind` and its `traces`.
    - A kind reference is a kind name in the holder's own scope, or a `{ scope, kind }` pair (`core/F50`). A trace target is an `id` in the holder's own scope, or a `{ scope, id }` pair.

    There is no field for incoming traces. Its body explains the registration to people and agents.
  - **What the DO Change ships.** The `Registration` Type Definition, and the Capability Node it names, ship with the DO Change. Core validates a registration's frontmatter with `core/C6`'s `validate`, and parses no YAML itself.
  - **What `core/C6` lacks.** `core/C6`'s value kinds hold scalars, lists of scalars, and one mapping, the `ref`. They cannot describe `kinds`, `instances`, a `{ scope, kind }` reference or a `{ scope, id }` target. So `core/C27`, a Core Change, gives `core/C6` a record value kind first: a mapping whose fields are declared, each with its own value kind. Scopes, identities and kind names are `parameter` values whose pattern only requires non-empty text, so `core/F1`'s "no free-text kind" stands. `core/C26` adds an acceptance test that a Registration Node passes `verify`, so `assemble`'s tests do not stand in for the frontmatter boundary.
- **core/A26** [core/F48–core/F56, core/N14]: `kaal-core/registration` exports `assemble(registrations)`. It is pure. It returns:
  - `scopes`, `kinds` and `instances`, each with its holder or owner. Each kind carries its `scope` and name. Each instance carries its `scope`, `id` and stated `kind`, as a `{ scope, kind }` pair;
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
| `core/C30` PLAN: kinds qualified by their owner's scope, hierarchies, and fixtures aligned to #583's Defect model | Core | `core/C24` |
| `graph/C2` PLAN (#562) and `graph/C3` DO: structural reach, reverse and cycles on any string identities | Graph | — |
| `core/C27`: `core/C6` gains a record value kind for nested frontmatter, PLAN and DO | Core | `core/C6` |
| `core/C26` DO: the `Registration` Type, `kaal-core/registration` and `verify`, with core/T50–core/T59 and core/T67 GREEN and a Registration Node passing `verify` | Core | `core/C24`, `core/C30`, `core/C11`, `core/C27`, `graph/C3` |
| Each kind's definition, with its rule and any `acyclic` declaration | that kind's owner | `core/C26` |
| Each holder's registration of its scope and instances | that holder | `core/C26` and the kinds it uses |

Which kinds exist, and which rules they register, are their owners' decisions. This PLAN prescribes none. Its tests use fixture kinds only.

Related work is referenced, not moved:
- Testing's identities `<capability>/T<n>` (`testing/N2`, #385) are Testing's own grammar for its kind, judged by Testing.
- Engineering's RATS (#285) keeps the steering of Requirements, Architecture and Testing.

Aligning `core/C9`'s Type prefixes with scope claims is a later decision. `core/C30` qualifies registration kinds by scope and leaves `core/C9`'s Types as they are.

Two Owner decisions are open and are not part of `core/C30`:
- **What a trace means.** A trace says only that one instance traces to another. If a kind's owner needs two relations between the same kinds, such as `refines` and `verifies`, the smallest addition keeps ownership with the source: the owner names relation kinds in its rule, and each trace states one. Core would still judge structure only.
- **An absent complement.** An instance of a kind whose owner is not installed, or a trace to an unresolved target, fails `kaal verify` (`core/F50`, `core/F52`). Under optional composition (2026-10-29), this could instead be reported as an unresolved complement without failing. `core/C25` is the README release-status Change (#512).
