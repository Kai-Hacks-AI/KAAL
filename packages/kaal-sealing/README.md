# kaal-sealing

The capability for establishing and verifying the immutable identity of a KAAL artifact, according to the identity defined for that artifact, as an npm package. One capability, delivered in two parts:

- `kaal/`: its KAAL contribution, the sealed Node `Sealing` (typed by `Skill`) and its seal. It is registered with an installed KAAL through `kaal-core`'s `registerSkill()`, which places it under `skills/kaal-sealing/` of the KAAL directory.
- `skills/kaal-sealing/`: its Agent Skills realization (`SKILL.md`, `scripts/`), installed under the host's `skills/`.

Sealing does not decide what constitutes an artifact's identity; each kind of artifact does. It carries the one definition of canonical identity for files and directories, a 2x2 grammar of {file, directory} by {unnamed, named} with the parent and location always excluded (`scripts/artifact-id.mjs`; the domain chooses the form and separates kinds) and the mechanics of a seal marker (`scripts/seal.mjs`). Node identity stays Core's, which must exist before any Skill; the Change and `work/` identities are Changing KAAL's, expressed as the form and domain they choose.

The package is not part of `kaal-core`: Core provides the `Skill` type and the registration, and this capability joins through them.

The public API is `payload()`, returning `{ kaal, skills }` as files keyed by path. The scripts need Node.js 20 or later and no other package. Registering needs `kaal-core`.

Build and test from this directory alone: `npm ci && npm test`. Engineering and acceptance live outside the package, in `engineering/kaal-sealing`.
