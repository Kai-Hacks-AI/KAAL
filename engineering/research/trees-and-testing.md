# Owned trees, traces and a reusable Testing package: research

This is research for the Owner, not a Definition, a PLAN or an authorization. It answers the Owner's question in #kaal (2026-10-27): can KAAL's Node and Edge model hold independently owned trees for Intent, Requirements and Architecture, joined by explicit traces, and what would make `kaal-testing` a useful independent package? It is revised to the Owner's clarification of 2026-10-28 17:16 CET on capability autonomy, identity and trees. Nothing here edits a contract. Where a current contract conflicts with the clarification, that is reported as analysis.

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

## Testing package: recommendation

**Option 2, a small runtime with no runtime dependencies, after #385's DO.** It is revised in three ways:
- **Testing's own concepts.** Testing defines Strategy, Plan, Suite and Case, their identity rules for its own content, and one outgoing rule: a Case traces to `any`. Testing never interprets a target.
- **Consumer identities as given.** The package reads a consumer's declared Suite and Case identities. It requires no KAAL spelling such as `<cap>/T<n>`.
- **Consumer data, not constants.** Loops and target kinds are the consumer's data.

The package offers observe, outcomes, classify, evaluate, a reporter and a fail-closed consumer entry (exit 0, 1 or 2). Acceptance and coverage built on Hosting stay KAAL-internal. Strategy and Plan stay the consumer's documents. Guard `0.0.4` is the reference: it has no dependencies, its manifest is its own data, and its exit codes are the shape option 2 generalizes.

## Contradictions with current contracts (analysis only)

1. **`testing/N2`** fixes a Case's identity as `<cap>/T<n>`. That is fine as KAAL's own convention. As a package rule, it would prescribe consumers' identities, against clarification point 2.
2. **`LOOPS` in `kaal-testing/lib/contracts.mjs`** hardcodes Intent, Requirements, Architecture and Code. That is Testing naming other owners' kinds, against point 1.
3. **TEST A FINDING** (`testing/C4`, #385, on `kaal/testing`) lists the permitted target kinds of a Case: Architecture, Functional and Nonfunctional Requirements, Intent and Defects. A closed list is against point 1 and against `core/F51`'s `any`.
4. **Guard** is consistent: its loops, identifiers and manifest are its own data.

These go to their owners, Testing for 1–3, as separate Changes if the Owner wants them. This document authorizes none of them.

## Open for the Owner

- Whether Testing should restate TEST A FINDING as an outgoing rule of `any`, keeping the list only as guidance.
- Whether `testing/N2` should become KAAL's convention rather than a package rule.
