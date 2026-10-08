# kaal-review

The capability for examining a result, reporting findings and establishing convergence, as an npm package. One capability, delivered in two parts:

- `kaal/`: its KAAL contribution, the sealed Node `Review` (typed by `Skill`) and its seal. It is registered with an installed KAAL through `kaal-core`'s `registerSkill()`, which places it under `skills/kaal-review/` of the KAAL directory.
- `skills/kaal-review/`: its Agent Skills realization (`SKILL.md`, `scripts/`), installed under the host's `skills/`.

Review is a capability and not a role, and it is specific to no result: the one asking names what is reviewed and how to identify it. Review carries the one definition of a round (`scripts/review.mjs`): the reviewer supplies the texts and never the structure, a round names the result and its exact identity, and `converged` answers whether the rounds in a directory end with one that says so about exactly that identity. It does not decide when a review is owed, who reviews or what follows, and it cannot show that a reviewer's statement of authority and independence is true. The interaction of Work and Review in a Change (ROWING) and the lifecycle of a Change (Changing KAAL) are other things; Changing KAAL consumes Review where it is installed.

The package is optional and is not part of `kaal-core`: Core provides the `Skill` type and the registration, and this capability joins through them, selected by the exact ID of its Node.

The public API is `payload()`, returning `{ kaal, skills }` as files keyed by path. The script needs Node.js 20 or later and no other package. Registering needs `kaal-core`.

Build and test from this directory alone: `npm ci && npm test`. Engineering and acceptance live outside the package, in `engineering/kaal-review`.
