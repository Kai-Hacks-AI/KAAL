# Change Nodes, Succession and Delivery: Architecture

Each element names, in brackets, the Requirements it answers.

- **change/A1** [change/F1, change/F4, change/F14, change/F15]: The DO Change ships three things in `capability/`:
  - **The Succeeds Definition**, a KAAL Definition that names the relationship.
  - **The Delivers Definition**, likewise.
  - **The Change Definition's statement of the Change Node.** It is typed by the Change Definition and named by its identity. Its predecessors and Intents are Edges of those two Definitions, and its required Cases are its `requires`.

  Change Nodes are found by content, as every Node is. Where a repository keeps them is that repository's choice, as for Change Records (#280).
- **change/A2** [change/F2–change/F6, change/F12–change/F17, change/N1, change/N2]: `kaal-change/delivery` exports `assess(nodes, { evidence })`. It is pure, imports only `kaal-graph`, and imports no host module. It returns:
  - `changes`, each with its identity and id;
  - `findings`;
  - `has(identity)`, `succeeds(identity, { transitive })`, `successors(identity, { transitive })` and `delivers(identity)`;
  - `delivery(identity)`, which given evidence is `{ satisfied, delivered, unmet, awaiting }` and otherwise `undefined`;
  - `exchange()`, the data form (change/F13).
- **change/A3** [change/F4, change/F5, change/F14]: **Graph represents and traverses.** `assess` holds the Nodes in a Graph, and uses Graph for four things:
  - `edges(type)` for the stated Edges of each Definition;
  - `in()` for successors;
  - `traverse` for the transitive views;
  - `resolve` and `named` for unresolved and stale targets.

  Change keeps no edge index of its own. Graph stays structural only: the meaning of Succeeds and Delivers, and every finding about them, are Change's.
- **change/A4** [change/F4, change/F12]: **Pinned by content.** A Graph Edge pins its target's id, which is the SHA-256 of its exact bytes.
  - **What content addressing establishes.** It holds for Change Nodes read from their bytes, as `identify()` reads them. To close a cycle, a Change would have to pin a Change that already pins it. Stating that Edge changes the first Change's bytes and so its id, which leaves the earlier Edge pinned to an id no longer present. The attempt therefore surfaces as a stale pin (change/F4), never as a resolved cycle (change/T17). This rests on SHA-256's preimage resistance, not on impossibility.
  - **What it does not establish.** Graph takes any frozen Node shaped as `identify()` returns it, and does not recompute its id. So a caller can hand `assess` Nodes whose ids are asserted rather than derived. `assess` therefore does not rely on the invariant: it reports any cycle among resolved Edges (change/F12, change/T18). Its walk terminates, which is Graph's `traverse` behaviour, and the finding is Change's succession semantics.
  - **What it costs.** Editing a Change Node changes its id, so every Change that succeeds it is stale until it is pinned again. `assess` reports this and never repairs it.
- **Pinning is not immutability** (Owner decision 6491567974, 2026-10-29). Content-addressed pinning and an immutability policy are different things, and Change provides only the first.
  - **What Change provides.** Identity, explicit Succeeds and Delivers Edges, stale-reference detection and derived navigation. A pin records which exact bytes a successor relied on. An edit to the target is never prevented, only reported as a stale pin (change/F4, change/T6).
  - **What the consumer decides.** Whether and when a particular Change Node may be edited, and how corrections are recorded, is the governance of the repository that consumes Change. Change imposes no Proposed/Accepted freeze and selects no lifecycle rule of its own.
  - **Why a consumer may freeze.** Preserving historical evidence against manipulation or retrospective rewriting is a reason for a consumer to choose immutability, for example to stop an agent rewriting accepted test evidence to manufacture success. Stale-pin findings give such a policy its evidence. Enforcing the policy is the consumer's, through its own controls.
- **change/A9** [change/F5, change/F13, change/N1]: **The optional data exchange.** `exchange()` (change/F13) is how Change's facts reach another capability.
  - **How it travels.** It is plain data. A consumer that has `kaal-change` passes it on, for example to Project's map (`project/C2`, #605). Neither capability imports the other, and Graph owns none of its meaning.
  - **What stays in-process.** `has`, `succeeds`, `successors`, `delivers` and `delivery` are Change's in-process views. They are not the exchange.
  - **What it means.** The form is Change's, and Change and each consumer align on it. A consumer reads and attributes it. It may not reinterpret or extend it. It holds no Lifecycle state, which is read from facts (#247). The delivery members appear only when evidence was given.
- **change/A10** [change/F15–change/F17]: **Delivery reads Testing's evidence and never produces it.**
  - **Who runs the tests.** The caller obtains Case Results from Testing, for example from a Run that Testing's model holds (`testing/F26`, `testing/F30`), and passes them in as `evidence`. Change runs no test, reads no Run, and imports no Testing module.
  - **Which result counts.** Change reads one word, `passed`, as Testing reports it. It defines no other result and maps none, so a Testing vocabulary that grows needs no Change to follow it. Whatever is not `passed` is unmet, and is passed through as Testing said it.
  - **Whose trust it is.** Whether a Run is trustworthy, and whether its provenance identifies the Case version that was declared, is Testing's (`testing/F31`) and the caller's choice of evidence. Change's verdict is stated relative to the evidence given, and the exchange carries no claim beyond it.
  - **Allowances are not delivery.** An allowed failed Case stays `failed` (`testing/F28`), so it is unmet. Whether a FAR decision lets a Change proceed is the Change Lifecycle's (`change/C2`), never a delivery result.
  - **Standalone.** Without Testing, or without evidence, Change still gives its Nodes, succession, Intents, required Cases and findings, and gives no delivery result.
  - **No universal gate.** A Change that requires a Case such as "is on main" puts promotion inside its own delivery boundary. Another Change may be delivered before reaching main. A merge on GitHub establishes nothing by itself.

## Ownership

| Who | Owns |
| --- | --- |
| Change | the Change Node, the Succeeds and Delivers relationships and their outgoing statements, each Change's required Cases (`requires`), the delivery criterion, `assess`, and the findings about them |
| Graph | representing and traversing Edges, structurally only |
| Testing | Test Case, Run and result semantics, what `passed` means (`testing/F26`), and each Case's `tests →` trace (`testing/N7`). Its FAR outcome refers to a Change by the same identity `<capability>/C<n>` (#385). |
| Intent | what an Intent is, and the Intent Nodes a Delivers Edge points to |
| Core | admission and registration mechanics, and global conformance, never the meaning of a relationship. Under Core's planned typed-relationships PLAN, Change registers the kind `Change` and the relationship types Succeeds (declared `acyclic`) and Delivers. Their instances are the Change Nodes' own Edges, read by name through that registration, never a second list (#600, comment 6503759803). That needs the Owner's decision to relax `core/F47` for Node-backed instances. Until it is taken, Succeeds and Delivers stay outside registration, and no second declaration of them is made anywhere. |
| Packaging | technical package dependencies (`Package —depends on→ Package`), which Succeeds is not |
| Project | its own sequencing (`before`) and its map. It consumes `exchange()` (#605). |
| Product | priority. It may point to Changes with an Edge type of its own. |
| Engineering | Branching and `engineering/guard/change.md`. That table can become a view derived from Guard's Change Nodes in a Change of Engineering's own. |

## Change graph

| Change | Owner | Succeeds |
| --- | --- | --- |
| `change/C1` PLAN, this Change | Change | nothing |
| DO: the Succeeds and Delivers Definitions, the Change Definition's statement, `kaal-change/delivery`, with change/T1–change/T8 and change/T17–change/T22 GREEN | Change | `change/C1` |
| This repository's own Change Nodes | Change | the DO Change, and the Owner's answer on #280 for where they live |
| Registering `Change`, Succeeds and Delivers with Core | Change | the DO Change, and Core's typed-relationships PLAN after the Owner's `core/F47` decision |
| Guard's Change table as a derived view | Engineering | this repository's Change Nodes for Guard |
| Priority over Changes | Product | the DO Change |
| Change map: rendering `exchange()`, and lifecycle as an attribute when facts are given | Change | the DO Change |
