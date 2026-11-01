# Architecture and input contract

- **change/A18:** The separate pure `isolate(proposal, model)` export does not
  depend on Change delivery/succession. It imports only Foundation's pure SHA-256.
- **change/A19:** Consume Graph's `resolve`, `check`, `out` and `traverse`
  contracts. Owner source Nodes expose normalized projections; Change defines
  this input transport, not the relationship meanings they project.
- **change/A20:** Obligations are references to required evidence. Testing owns
  execution/doubles; a passed double cannot set an obligation's status.
- **change/A21:** Deliver the minimal Change foundation, isolation library, docs
  and own verification. Hosting owns I/O in the verification/publisher tooling.

## Proposal

`{ ref: { name, id }, alters: ['shop/I1'], scope: ['shop'] }`.

The exact Change reference must match `model.change` and resolve in Graph. Its
Node's frontmatter must state the same alters/scope lists. This is model binding,
not proof the Change was approved.

## Owner model

`{ change, owners: ['shop', ...], sources: [{ owner: 'shop', ref }], graph }`.

Each expected owner has exactly one resolving source. That source's frontmatter
holds `inventory: { elements, interfaces, traces }`:

| Entry | Shape |
| --- | --- |
| Element | `{ identity, kind, ref }`; owner is the source namespace |
| Interface | `{ identity, ref, from, to, contract: {name,id} }` |
| Trace | `{ source: Ref, type: Ref, target: Ref, boundary: string or null }` |

Element identities use their owner's namespace; references must resolve by both
name and content id. Supported descriptive kinds are `intent`, `requirement`,
`nonfunctional-requirement`, `defect`, `architecture`, `case`, `realization`.
An interface's from/to name inventoried elements. A boundary Trace links those
exact endpoints and names the interface identity. `boundary: null` is the owner's
explicit projection of a semantic reference; Change does not guess interface
meaning from an edge-type name. Cross-scope semantic references are reported.

Source Nodes can be built through Graph's `createNode` with owner-derived views
in `frontmatter.inventory`; then add the Node and supply its reference. Owner
adapters must independently assemble these views from their real source formats.
A changed source inventory has a changed content identity. The model digest binds
the Change ref, sorted expected owners and sorted source refs using Foundation.

All resolved graph relations originating in inventoried elements/interfaces must
match the owner inventories, and every declared relation must occur in Graph.
Owner inventory omissions can still describe a different smaller model. This API
never authenticates repository completeness, signatures or conversion status:
its explicit authority result remains unestablished even for a consistent model.

## Output

The assessment contains `scope`, `selected`, `impact`, `affectedOutside`,
`dependencies`, `boundaries`, `externalReferences`, `obligations`, `findings`
and `modelDigest`, plus the exact `proposal` and owner `sources` references.
Findings distinguish violations from unknown evidence.
All obligations have `status: 'not-assessed'`. No result is a CI/release gate.

Graph/owner access failures become unknown findings. Cycles are Graph's
responsibility; input order does not change the assessment or mutate inputs.
The public TypeScript declarations specify all transport fields.

## Agent Skill anchor

- **change/A22 [change/F46–change/F48, change/N12]:** Core admits the separate
  Change Practice Node in `payload/`. The Agent Skill and all its relative
  resources live under `skills/kaal-change/`. Guidance owns decisions; its example
  invokes the existing public pure core using controlled Graph data. Existing
  delivered Cases share that example data through a fixture re-export. No second
  isolation engine, target loader or automatic trace converter is introduced.

The host chooses discovery and placement. Skill resources may be relocated into
an operator environment where the installed package and providers resolve. Embed
registration uses Core's public commands. External operation reads its supplied
context through authorized interfaces; the controlled example reads no target
context and changes no target bytes. These are execution/packaging tests, not a
claim that every agent will follow the written procedure correctly.
