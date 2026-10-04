# engineering-kaal-skill (engineering)

The machinery that proves the delivery of `packages/engineering-kaal-skill`, the capability for engineering KAAL Skills. It is not shipped, and it is not part of `kaal-core`.

`npm test` here is acceptance, run on what the package actually ships:

- **Delivery.** Deploy `kaal-core`'s payload, register the capability's Node through Core's `registerSkill()`, and show that Core carried no Skill before, that exactly one Node and one seal are added, that the Node is found by its type alone, and that its bytes and identity are the ones sealed.
- **Realization.** The Agent Skill is one skill, named as its directory, and points to the Nodes rather than defining the capability again.
- **Scripts.** `check-skill` and `register-skill` are run as an agent would run them, including the cases they must refuse. `check-skill` judges layout and Agent Skills conformance only; that a Node is sealed by its own bytes, and that no seal is orphaned, is Core's, reached through `register-skill --check`, and the acceptance shows the two divide the work that way.

Admission is judged by the one implementation `kaal-core`'s registration uses, reached in the built package and not through its public API.

Sealing is not reimplemented here: the capability teaches the repository's existing sealing helper and leaves seal checking to Core's registration, and the acceptance only shows that the shipped Node is sealed by its own bytes.
