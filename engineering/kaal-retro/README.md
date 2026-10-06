# kaal-retro (engineering)

The machinery that proves the delivery of `packages/kaal-retro`, the capability for creating a retrospective in its canonical form and for telling whether something is one. It is not shipped, and it is not part of `kaal-core`.

`npm test` here is acceptance, run on what the package actually ships:

- **Delivery.** Deploy `kaal-core`'s payload, register the capability's Node through Core's `registerSkill()`, and show that Core carried no such Skill before, that exactly one Node and its seal are added, that the Skill is found by its type alone, that its bytes and identity are the ones sealed, and that its Node says what a retrospective is and what Retro does and does not decide, without any mechanism and without naming any process.
- **Realization.** The Agent Skill is one skill, named as its directory, points to the Nodes rather than defining the capability again, and ships exactly one script, which knows nothing of Git, GitHub or any process.
- **The form.** `retro.mjs` is challenged through the command an agent runs: the canonical bytes are written out here as literal text; a text may be several paragraphs; a text may hold anything, headings of every level included, and is written escaped and read back exactly as given; what it refuses (an empty part, an existing destination, a missing, repeated or unknown part) it refuses without writing anything; `check` accepts exactly the canonical form and rejects each way of being near it; and every retrospective this repository already holds, of every seat and generation, passes `check`.
- **Conventions.** The capability passes the checks Engineering KAAL Skill carries, and its contribution passes `register-skill --check`.

Admission is judged by the one implementation `kaal-core`'s registration uses, reached in the built package and not through its public API. The shipped Node was sealed with the Sealing capability's own scripts; the acceptance only shows it is sealed by its own bytes.
