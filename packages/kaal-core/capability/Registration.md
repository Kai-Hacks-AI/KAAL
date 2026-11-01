---
name: Core/Registration
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
capability:
  name: Core
  id: 06f759e5f656d34492ab86fac95a9ee6171fecc5e7292fb6366527f9d2a3c724
---

# Core/Registration

A Registration is one holder's explicit statement of the scope it claims, the kinds it defines in that scope, each with its outgoing rule, and the instances it holds, each with its identity, its kind and its outgoing traces. The holder is a Capability or a consuming repository. A Capability ships its registration with its contribution, as it ships its Type Definitions, and a consuming repository keeps its own beside its content.

Its frontmatter holds `holder`, `scope`, `kinds` and `instances`, and Core validates it against kaal-core/registration's `REGISTRATION_SCHEMA`. A kind reference is a kind name in the holder's own scope, or a `{ scope, kind }` pair. A trace target is an identity in the holder's own scope, or a `{ scope, id }` pair. There is no field for an incoming trace: incoming views are derived, never stated.

Core reads scopes, identities and kind names as opaque text. What a kind means, and what its identities look like, are its owner's. Core judges only the assembled registrations: who holds which scope, whether each reference resolves, and whether each trace is permitted by its kind's registered rule. A cycle, an untraced instance and a term several owners define are reported, never judged.
