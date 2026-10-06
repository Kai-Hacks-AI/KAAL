# changing-kaal

The capability for managing changes to KAAL, as an npm package. One capability, delivered in two parts:

- `kaal/`: its KAAL contribution, the sealed Node `Changing KAAL` (typed by `Skill`), the sealed KAAL Definition `RATIFICATION` (a mnemonic for the disciplined change idea; delivered here, owned by nothing), and their seals. They are registered with an installed KAAL through `kaal-core`'s `registerSkill()`, which places them under `skills/changing-kaal/` of the KAAL directory.
- `skills/changing-kaal/`: its Agent Skills realization (`SKILL.md`, `references/`, `scripts/`), installed under the host's `skills/`.

The Node carries what the capability means to KAAL; the Agent Skill is the agent-facing form of it and does not define it again. The realization establishes the change record, `changes/<name>/YY/MM/DD/CC/` inside the installed KAAL directory, with `scripts/next-change.mjs` allocating `CC`, and the process through it: work, seal work, `retro-work.md` (the worker's own 4L retrospective, from inside the Work, written only after the work is sealed), the handoff, where the worker stops, then `retro-observe.md` (the observer's own 4L retrospective, from outside the Work, written after reading the Work and `retro-work.md` by an actor independent of the Work and of the worker's execution), seal Change. Changes closed with the historical single `retro.md` stay valid as they are. Where a change is in that process is derived from the record and its seals, never written down. Sealing and state are the repository's provisional helpers; this package ships no script for them.

The package is not part of `kaal-core`: Core provides the `Skill` type and the registration, and this capability joins through them.

The public API is `payload()`, returning `{ kaal, skills }` as files keyed by path. The script in the Agent Skill needs Node.js 20 or later, and registering needs `kaal-core`.

Build and test from this directory alone: `npm ci && npm test`. Engineering and acceptance live outside the package, in `engineering/changing-kaal`.
