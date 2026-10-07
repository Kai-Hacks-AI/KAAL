# kaal-changing

The capability for managing changes to KAAL, as an npm package. One capability, delivered in two parts:

- `kaal/`: its KAAL contribution, the sealed Node `Changing KAAL` (typed by `Skill`), the sealed KAAL Definitions `RATIFICATION` (a mnemonic for the disciplined change idea) and `ROWING` (a mnemonic for the discipline of review: Review Observed Work, Intelligent Not Generalized), both delivered here and owned by nothing, and their seals. They are registered with an installed KAAL through `kaal-core`'s `registerSkill()`, which places them under `skills/kaal-changing/` of the KAAL directory.
- `skills/kaal-changing/`: its Agent Skills realization (`SKILL.md`, `references/`, `scripts/`), installed under the host's `skills/`.

The Node carries what the capability means to KAAL; the Agent Skill is the agent-facing form of it and does not define it again. The realization establishes the change record, `changes/<name>/YY/MM/DD/CC/` inside the installed KAAL directory, with `scripts/next-change.mjs` allocating `CC`, and the process through it: work and review in rounds (`review/NN.md`, by the Reviewer, until one converges on the Work as it stands), seal work, `retro-work.md` (the Worker's own 4L retrospective, from the Work's seat), then `retro-owner.md` (the Owner's own, from the Owner's seat, after the Owner's judgment of the sealed Work; it carries no approval) and then `retro-review.md` (the Reviewer's own, from the review's seat), all written only after the work is sealed and in that order, which is WORK, seal Change. Owner, Worker and Reviewer are roles of the process (two that row and one that steers), defined in the Agent Skill, not Nodes and not necessarily three actors. Changes closed with the historical single `retro.md`, or with `retro-work.md` and `retro-observe.md`, stay valid as they are. Where a change is in that process is derived from the record and its seals, never written down. Sealing and state are the repository's provisional helpers; this package ships no script for them.

The package is not part of `kaal-core`: Core provides the `Skill` type and the registration, and this capability joins through them.

The public API is `payload()`, returning `{ kaal, skills }` as files keyed by path. The script in the Agent Skill needs Node.js 20 or later, and registering needs `kaal-core`.

Build and test from this directory alone: `npm ci && npm test`. Engineering and acceptance live outside the package, in `engineering/kaal-changing`.
