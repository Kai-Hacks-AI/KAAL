# kaal-retro

The capability for creating a retrospective in its canonical form and for telling whether something is one, as an npm package. One capability, delivered in two parts:

- `kaal/`: its KAAL contribution, the sealed Node `Retro` (typed by `Skill`) and its seal. It is registered with an installed KAAL through `kaal-core`'s `registerSkill()`, which places it under `skills/kaal-retro/` of the KAAL directory.
- `skills/kaal-retro/`: its Agent Skills realization (`SKILL.md`, `scripts/`), installed under the host's `skills/`.

A retrospective is one writer's own account in four parts: Learned, Liked, Lacked, Longed. Retro carries the one definition of its form (`scripts/retro.mjs`): the writer supplies four texts and never the structure, so a malformed retrospective is possible only through a direct edit. It does not decide when a retrospective is owed, who writes it or what it is about; a process that asks for one, such as Changing KAAL, decides that and uses Retro for the form.

The package is not part of `kaal-core`: Core provides the `Skill` type and the registration, and this capability joins through them.

The public API is `payload()`, returning `{ kaal, skills }` as files keyed by path. The script needs Node.js 20 or later and no other package. Registering needs `kaal-core`.

Build and test from this directory alone: `npm ci && npm test`. Engineering and acceptance live outside the package, in `engineering/kaal-retro`.
