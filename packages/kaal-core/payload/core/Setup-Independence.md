---
name: Setup Independence
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# Setup Independence

Setup independence is a property of a capability package: its runtime needs name no KAAL package except `@kaihacksai/kaal-foundation` and `@kaihacksai/kaal-hosting`. What a package needs only to be built or tested is not a runtime need. The property has this one definition, and no adopter widens it.

Three judgements stay distinct. A package is **declared** independent when its manifest names no other KAAL package. It is **demonstrated** independent only when an isolated installation of the packed package runs without one, which is evidence of the capability's own acceptance, never of the manifest. A setup **accepts** a dependency when its adopter decides that package is acceptable there. An acceptance can make a setup acceptable. It cannot make the package independent.
