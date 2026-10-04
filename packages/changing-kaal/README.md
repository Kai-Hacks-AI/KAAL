# changing-kaal

The capability for managing changes to KAAL, as an npm package. One capability, delivered in two parts:

- `kaal/`: its KAAL contribution, the sealed Node `Changing KAAL` (typed by `Skill`) and its seal. It is registered with an installed KAAL through `kaal-core`'s `registerSkill()`, which places it under `skills/changing-kaal/` of the KAAL directory.
- `skills/changing-kaal/`: its Agent Skills realization (`SKILL.md`, `references/`, `scripts/`), installed under the host's `skills/`.

The Node carries what the capability means to KAAL; the Agent Skill is the agent-facing form of it and does not define it again. The realization establishes the change record, `changes/<name>/YY/MM/DD/CC/` inside the installed KAAL directory, with `scripts/next-change.mjs` allocating `CC`, and its first immutable artifact, `retro.md`: the participating agent's own 4L retrospective.

The package is not part of `kaal-core`: Core provides the `Skill` type and the registration, and this capability joins through them.

The public API is `payload()`, returning `{ kaal, skills }` as files keyed by path. The script in the Agent Skill needs Node.js 20 or later, and registering needs `kaal-core`.

Build and test from this directory alone: `npm ci && npm test`. Engineering and acceptance live outside the package, in `engineering/changing-kaal`.
