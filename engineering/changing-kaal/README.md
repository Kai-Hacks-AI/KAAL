# changing-kaal (engineering)

The machinery that proves the delivery of `packages/changing-kaal`, the capability for managing changes to KAAL. It is not shipped, and it is not part of `kaal-core`.

`npm test` here is acceptance, run on what the package actually ships:

- **Delivery.** Deploy `kaal-core`'s payload, register the capability's Node through Core's `registerSkill()`, and show that Core carried no such Skill before, that exactly one Node and one seal are added, that the Node is found by its type alone, that its bytes and identity are the ones sealed, and that it states no mechanism.
- **Realization.** The Agent Skill is one skill, named as its directory, points to the Nodes rather than defining the capability again, and carries the change record convention and the form and perspective of `RETRO.md`.
- **Allocation.** `next-change` is run as an agent would run it: the next number after the highest, no reuse of gaps, refusal at 99, nothing written but the directory.
- **Conventions.** The capability passes the checks Engineering KAAL Skill carries, run from that capability, and its contribution passes `register-skill --check`.

Admission is judged by the one implementation `kaal-core`'s registration uses, reached in the built package and not through its public API. Sealing is not reimplemented here: the shipped Node was sealed with the repository's existing helper, and the acceptance only shows it is sealed by its own bytes.

Retrospective content is agent judgement and is not tested; only its form is stated, in the Agent Skill.
