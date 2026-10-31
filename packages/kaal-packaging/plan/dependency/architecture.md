# Dependency traces: Architecture

## For the Owner

**1. Stated Edges, or derived ones?** P2 allows either.
- **Derived (recommended).** Packaging derives the Edges from the manifests, as above. The manifest is already the authority: npm installs from it, and packaging/F7 judges it. Nothing is written twice, so nothing can drift.
- **Stated.** Each package's Node would carry `Depends on` Edges by hand. Every dependency change would then be made twice, in `package.json` and in a Node. Because a Node's identity is its bytes, it would also change that Node's id, and every ownership claim naming it would need a mechanical refresh (`engineering/research/representation.md`, §6).

**2. What is "another package's identity" in the Graph?**
- **The Package Node (recommended).** The target is the Package Node that packaging/F22 derives from the dependee's manifest. It is attributed to the dependee's owner through the claim covering that manifest. For hosting/C11, the changed element would be stated as the Package Node named `kaal-hosting`. Reverse traversal from it reaches every Realization that depends on it.
- **A Requirement the dependee owns.** If the Owner wants the changed element to be a Requirement, as `traceability.md` reads ("a Hosting Requirement whose identifier Hosting assigns"), the Package Node would carry one more Edge, to that Requirement. That needs each owner to make that Requirement a Node and to name it from its package. Both are the Requirement owners' part of P2, and Packaging would add the Edge in a later Change once they exist.

## Design

- **packaging/A15** [packaging/F20, packaging/F21, packaging/N13]: **Ecosystem-neutral, npm first.** `lib/dependency.mjs` holds the relation and its findings, the same for every ecosystem. `lib/npm/` reads the manifest fields (`name`, `version` and the four dependency fields), as packaging/A10 already does for F7. It is exported as `kaal-packaging/dependency`.
- **packaging/A16** [packaging/F22]: **Identity Nodes have no Edges.** Each package becomes two Nodes, not one. An edge-free Package Node is constructed first, so its id is known. The Realization Node, which carries the Edges, is constructed after. A dependency cycle between packages, such as two packages naming each other in `devDependencies`, therefore still builds. One Node per package carrying its own Edges could not be content-addressed around a cycle.
- **packaging/A17** [packaging/F22, packaging/N8]: **Graph is handed in.** Packaging does not import `kaal-graph`. Its caller, Engineering for engineering/C11, passes `createNode` and adds the Nodes to the Graph it traverses, together with Packaging's Definition Nodes. If Graph's Form refuses a Node, the refusal is a finding naming the manifest. Packaging does not repair it.
- **packaging/A18** [packaging/I8]: **Other owners' traces.** Engineering's drivers import `kaal-hosting`, and the root scripts select it with `-w kaal-hosting`. Neither is a manifest dependency. They are code and script traces, and engineering/C11 decides whose they are. The root `package.json` is a manifest. It declares workspaces, and any dependency it declares is derived like the others. Who owns the root files is P3's question.

## Hosting/C11 replay

Read on `kaal/hosting` at bf98e7b. Four manifests declare `kaal-hosting` in `dependencies`: `packages/kaal-core/`, `packages/skills/kaal-engineer-skill/`, `packages/skills/kaal-graph/` and `packages/skills/kaal-testing/`. From the Package Node `kaal-hosting`, reverse traversal over `Depends on` reaches exactly those four Realizations. Foundation's manifest is not reached. This matches the impact `traceability.md` computes for these capabilities. Engineering's own reach comes from its imports (packaging/A18), not from this trace.

## Changes

1. **packaging/C10 PLAN**, this document.
2. **packaging/C11 DO.** packaging/T37–T49, RED first, then `lib/dependency.mjs`, the npm reading, the Definition Nodes in `capability/`, the command, the shipped documents, the skill section and the regenerated `test/verify.json`. It touches only `packages/kaal-packaging/`.
3. **engineering/C11 DO** consumes it, as Engineering's own Change.
