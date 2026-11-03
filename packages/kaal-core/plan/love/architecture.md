# Core as a Package, and LOVE: Architecture

Each element names, in brackets, the Requirements it answers.

- **core/A16** [core/F39]: `LOVE` is a Definition Node, `payload/core/LOVE.md`, carried like `CASE`. The Kernel's Foundation names only the six foundational Nodes, so the Kernel's bytes stay the same and every existing id is unchanged. Engines bootstrapped before `core/C17` lack the Node. kaal-core 0.0.1 is unreleased, so there is no migration.
- **core/A17** [core/N11, core/F39]: The split between Core and Testing:
  - **Core** owns what LOVE asks of a package, and the structure LOVE is asked about: Capabilities, ownership claims as Core's own data, installation contracts and interfaces.
  - **Testing** owns what counts as independent evidence and how it is classified (`testing/C7`), and how ownership claims are read and attributed (`kaal-testing/attribution`).
  - **Engineering** decides when either runs and what it gates.

  Dependencies run one way: disciplines → Core → Graph → Hosting, with Foundation at the bottom. Testing consumes Core's types and admission. Core never imports Testing, and it classifies no evidence of its own.
- **core/A18** [core/F40]: The Core Capability Node is `packages/kaal-core/capability/Core.md`, beside Core's tree in the way `capability/Testing.md` sits in Testing's. It is not part of the payload, so no Engine changes. The claim `packages/kaal-core/ownership.kaal.json` claims `packages/kaal-core/`.
- **core/A19** [core/F41]: The interface is what `exports` lists, plus the `kaal` command. `core/C17` decides each of the four exported values the README does not name today: `KaalError`, `isKind` and `readContribution` from `kaal-core`, and `isTypeName` from `kaal-core/frontmatter`. Each is either documented as interface or removed from the entry point.

## Options considered for where LOVE is defined

| Option | What changes | Cost |
| --- | --- | --- |
| **A. A `LOVE` Definition in Core's payload** (recommended) | One new Node, carried and resolvable in every Engine, beside `CASE`. | None to existing ids. Agents in a consumer repository can resolve it by name. |
| B. Amend `KAAL Capability` | The Definition's text gains the criteria. | Its id changes, so every Capability Node's type reference must change. LOVE is about packages, and `KAAL Capability` already says packaging does not define a Capability. |
| C. Plan text only | Nothing is carried. | Consumer repositories and their Agents never see the criterion. |

## Evaluation of kaal-core against LOVE

This is validation, a reasoned judgment, at `origin/main` 24e04ac. The Owner decides it.

| Criterion | What holds | What is missing | Where it goes |
| --- | --- | --- | --- |
| **Lifecycle** | Install: `npm install kaal-core`, then `kaal init`, works from the packed tarball in a fresh host (Engineering's Embed scenario). `init` leaves a valid Engine unchanged. Core keeps a record of its own provider deployments. | Upgrade: an Engine from an earlier kaal-core no longer verifies, and there is no migration (README). Remove: no command. Version: the Engine records no Core version. Core states no Installation Contract for itself, although `core/I3` asks one of every Capability. kaal-core cannot come from a registry while `kaal-graph` and `kaal-hosting` are unpublished. | A Core lifecycle PLAN, after this one. |
| **Ownership** | No discipline semantics: Core's sources and payload name none. Its runtime dependencies, Graph and Hosting, depend on no part of Core (Embed scenario). | No Core Capability Node and no ownership claim, so attribution cannot give Core's files to Core. Core keeps its own SHA-256, which duplicates Foundation's. | `core/C17` (`core/F40`), and `core/C12` (#378). |
| **Verification** | 139 Code and planned tests. The Embed scenarios exercise the packed package in a fresh host, without the engineering repository. | No contract evidence mapping (`evidence.kaal.json`) ties Core's consumer-visible statements to those scenarios. Even with one, Testing reports every statement unknown until per-test results come from an observed run. | `testing/C7`, then a Core evidence mapping. |
| **Encapsulation** | `exports` is closed: five entry points and `package.json`. Nothing else resolves. | Four exported values are undocumented (`core/A19`). | `core/C17` (`core/F41`). |

kaal-core does not yet meet LOVE. Only Ownership and Encapsulation can be closed by `core/C17`. Lifecycle needs its own PLAN, and Verification waits on Testing. That is a packaging judgment only. Nothing here changes a package's name, scope, `private` flag, registry or version.

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `core/C16` PLAN, this Change | Core | none |
| `testing/C7` PLAN: contract evidence from observed runs | Testing | none, in parallel |
| `core/C17` DO: the `LOVE` Node, the Core Capability Node and claim, the interface decisions | Core | `core/C16` |
| `core/C12` DO: Core hashes through Foundation (#378) | Core | Graph's and Engineering's acceptance install lines |
| Core lifecycle PLAN: upgrade, remove and version of an Engine, Core's own Installation Contract | Core | `core/C16` |
| Core contract evidence mapping | Core | `testing/C7`'s DO |
| Packaging decision for kaal-core | Owner | all four criteria met |
| Release authorization | Owner | the packaging decision, and nothing implied by it |
