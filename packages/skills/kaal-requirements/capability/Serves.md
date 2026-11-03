---
name: Serves
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# Serves

Serves is the Edge by which a Requirement states the Intent it serves. It runs from a Requirement Node to an Intent Node, in that direction only, and names the Intent by the id it has when the Requirement is stated.

It transfers no ownership. The Requirement stays its context's, and the Intent stays Intent's. It is a reference, not a dependency, and no Intent is a prerequisite of a Requirement.

It is stated only where an Intent is represented as a Node, and not otherwise. A Requirement that serves no represented Intent has no Serves Edge, and is a Requirement all the same.

What prompted a Requirement to be identified, its trigger, is not recorded as Serves. A trigger is not an Intent.

Which Requirements serve an Intent is read from the Edges that name it, and is never stored beside the Intent. When the Intent changes, its id changes, and the Edge is reported as naming another id. The Requirement is not changed by that, and whether it still serves the Intent is for its context to judge.
