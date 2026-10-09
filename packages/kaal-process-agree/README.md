# kaal-process-agree

The Process in which a Worker agrees a result with an independent Reviewer, and hands the Work to a human (HOW, Human Observes Work) when it cannot, as an npm package. First use: describing an Intent. One capability, delivered in two parts:

- `kaal/`: its KAAL contribution, the sealed Node `Agreement` (typed by `Skill`, a specialized Skill that composes `Intent` and `Review`) and its seal. It is registered with an installed KAAL through `kaal-core`'s `registerSkill()`, which places it under `skills/kaal-process-agree/` of the KAAL directory.
- `skills/kaal-process-agree/`: its Agent Skills realization (`SKILL.md`, `scripts/agree.mjs`), installed under the host's `skills/`.

The Owner's grant says who works, who reviews and how many rounds may be run. The record of the loop (versions put forward, the Reviewer's reports in Review's own form, human directions) is the only thing that says what may happen next; `agree.mjs state` derives it every time and requires HOW on a closed list of conditions. It reads from a report only its outcome, what it is about and who made it, never the findings. It composes `kaal-intent` and `kaal-review`, which must be installed beside it, and changes neither.

The package is optional and is not part of `kaal-core`: Core provides the `Skill` type and the registration, and this Process joins through them, selected by the exact ID of its Node.

The public API is `payload()`, returning `{ kaal, skills }` as files keyed by path. The script needs Node.js 20 or later. Registering needs `kaal-core`.

Build and test from this directory alone: `npm ci && npm test`. Engineering and acceptance live outside the package, in `engineering/kaal-process-agree`.
