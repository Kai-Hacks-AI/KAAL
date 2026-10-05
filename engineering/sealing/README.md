# sealing (engineering)

The machinery that proves the delivery of `packages/sealing`, the capability for establishing and verifying the immutable identity of a KAAL artifact. It is not shipped, and it is not part of `kaal-core`.

`npm test` here is acceptance, run on what the package actually ships:

- **Delivery.** Deploy `kaal-core`'s payload, register the capability's Node through Core's `registerSkill()`, and show that Core carried no such Skill before, that exactly one Node and its seal are added, that the Skill is found by its type alone, that its bytes and identity are the ones sealed, and that its Node says what Sealing means without deciding what an artifact's identity is and without any mechanism.
- **Realization.** The Agent Skill is one skill, named as its directory, points to the Nodes rather than defining the capability again, and ships exactly two scripts, neither knowing of Git or GitHub.
- **Artifact identity.** `artifact-id` (the 2x2 grammar of file or directory, unnamed or named) is challenged from outside: expected IDs are built here from the written format and from pinned literals, including the sealed identity of genesis Change `01`, which Sealing did not define. The named-tree rule (root name in, parent and location out) and everything that must be refused are shown.
- **Seals.** `seal` writes, checks and lists empty markers named by an ID, never computes an ID and has no way to remove a seal.
- **Conventions.** The capability passes the checks Engineering KAAL Skill carries, and its contribution passes `register-skill --check`.

Admission is judged by the one implementation `kaal-core`'s registration uses, reached in the built package and not through its public API. The shipped Node was sealed with the repository's existing bootstrap helper, `seal-kaal-artifact`, because Sealing cannot seal its own birth; the acceptance only shows it is sealed by its own bytes.
