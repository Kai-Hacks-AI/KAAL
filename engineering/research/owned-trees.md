# Owned trees and outgoing traces: research

This is research for the Owner, not a Definition, a PLAN or an authorization. It answers the Owner's question in #kaal (2026-10-27): can KAAL's Node and Edge model hold independently owned trees for Intent, Requirements and Architecture, joined by explicit traces? The Testing package half of the question is Testing's, in its own PR. It is revised to the Owner's clarification of 2026-10-28 17:16 CET on capability autonomy, identity and trees. Nothing here edits a contract. Where a current contract conflicts with the clarification, that is reported as analysis.

## The clarification it follows

1. Each Capability defines its own concepts, semantics, identity rules, claims, operations and **outgoing** trace rules. Incoming traces are never declared by the receiving Capability. They are derived views of others' outgoing traces.
2. Core does not own the identities or meanings of other Capabilities' artifacts. `kaal-requirements` defines what a Functional Requirement is and how one is identified. The consuming repository owns the actual requirements. Core and Graph supply generic assembly, validation and traversal only.
3. Any concern may organise its own content as a tree, with edge meanings it defines and outgoing traces across trees. There is no special utility tree and no mandatory universal tree or schema.

## What exists

- **Graph** (main). An Edge goes out from the Node it is embedded in. Its meaning belongs to the Node its type names. A target needs no reference back, and every incoming view is derived (`packages/skills/kaal-graph/payload/Graph.md`). Graph imposes no hierarchy, so a tree is a convention its owner defines.
- **Core** (`core/C24`, #518, merged into `kaal/core` 2026-10-29). It already follows the clarification:
  - A kind's owner registers its kind and outgoing rule, which may be `any`.
  - The holder of the content, a Capability or a consuming repository, registers its instances and their identities.
  - Core reads identities as opaque text, unique within a scope, and holds no kind matrix (`core/F48`, `core/F51`, `core/F54`).
  - Its fixtures use a consumer, `acme-product`, whose identities share no grammar.
- **Graph mechanics** (`graph/C2`, #562): reach, reverse and cycles on string identities, with no domain meaning.
- **Owners still landing.** Requirements (#276, #553), Architecture (#485, #588) and Intent (`kaal/intent`, not promoted).
- **Guard `0.0.4`** as the reference product. Its identifiers are prose ids defined in its own `docs/`. Its Test Cases cite their targets in their titles, and its verification manifest derives coverage from those titles.

## Trees: recommendation

**Option B: owners' outgoing rules, holders' instances, derived incoming views.**
- Each kind's owner defines its concepts, identity rules and outgoing trace rule. A rule may be `any`, so no owner enumerates other owners' kinds.
- The holder of the content owns its instances and their identities.
- Incoming traces are derived, never declared.
- Each owner decides whether its content is a tree, and what its internal edges mean. A utility tree is one example of such a tree, not a feature of any Capability.
- Core and Graph assemble, check uniqueness within a scope, resolve, reverse and check cycles. They give no meaning.

`core/C24` already realizes the Core half. What remains is each owner's own Definitions, as their Capabilities land.

**Withdrawn from the first answer:**
- The lean that a utility tree is a Requirements-owned view. It was one example of a tree any owner may draw.
- "Ownership boundaries" read as if Engineering assigned trees to owners. Each owner decides for itself.
- "Should traces pin versions or names?" Identity is each kind owner's rule, not a Core choice.
- "D→T only." It is superseded by the Owner's correction on #583: a Test Case traces to the Defect it tests.

**Migration-path assurance** stays a cross-product NFR. Each product owns it in its own Requirements. Change owns the authorized transition, Testing supplies transition evidence without policy, and operations runs outside Git.

## Testing package

Testing owns this part and answers it in its own PLAN, #601 (`testing/C14`, into `kaal/testing`). That PLAN covers Strategy, Plan, Suite and Case as Testing's optional tree, an open outgoing Case rule that prescribes no other capability's kinds, derived incoming views, and package option 2 with no Hosting dependency. Engineering's earlier points stand as input only: Guard `0.0.4` proves a product verification entry needs no runtime dependencies, and its loops, identifiers and manifest are Guard's own data, consistent with the clarification.

## Open for the Owner

- Nothing on the trees beyond confirming option B. Each owner's Definitions follow as their Capabilities land.
