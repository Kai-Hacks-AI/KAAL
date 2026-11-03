---
name: Requirement
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# Requirement

A Requirement states what must hold. It is one functional or non-functional condition that what is built is to satisfy, held by the business context responsible for it, and stated precisely enough to be verified by test or other evidence.

It answers what, and only that. It does not say why (Intent), where (Architecture), how (Code), or whether it holds (Testing).

It may name an Intent it traces to, where one is represented. That trace is a reference, not a dependency, and it transfers no ownership.

A Requirement Node is named `<capability>/F<n>` for a functional Requirement and `<capability>/N<n>` for a non-functional one, where `<capability>` is the capability whose context holds it and `<n>` is its number there. A Requirement Node states the Intents it serves as `Serves` Edges, where they are represented, and none where none is.

What prompted it to be identified, its trigger, may be recorded beside it. The trigger is neither the Requirement nor its Intent.

A condition that cannot be verified is not yet a Requirement.
