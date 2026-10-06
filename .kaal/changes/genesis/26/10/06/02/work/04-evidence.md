# Evidence

What this Change realized, and where a Reviewer can read it. The realization lives outside `work/`; this file says what to read and what was shown.

## Realized

- `packages/kaal-changing/kaal/ROWING.md` and its seal: a KAAL Definition typed by the `KAAL Definition` Node, delivered beside `RATIFICATION`. The Changing KAAL Node, RATIFICATION, Core and every existing seal are byte-for-byte as they were.
- `packages/kaal-changing/skills/kaal-changing/`: `SKILL.md` (process with review, steps, rules), `references/rowing.md` (new: roles, what ROWING asks of a round, the form of a round, iteration, separation) and `references/retro.md` (the two retrospectives, `retro-work.md` and `retro-review.md`, and the historical forms). The installed projection under `skills/` and `.kaal/skills/` is derived by the installer.
- `engineering/change-seal/helpers/process.ts` (the one evaluator), with `changes.ts` and `cli.ts`: rounds, the new stages, the sealing and closing preconditions, the historical forms, and the `work:` line that `state` prints.
- Acceptance: `engineering/change-seal/acceptance/process.test.ts`, `engineering/kaal-changing/acceptance/delivery.test.ts`, `engineering/kaal-install/acceptance/install.test.ts`, `packages/kaal-changing/test/package.test.ts`, and the READMEs of the three engineering directories and the package.

## Shown

- The full test run passes, and the seal check, the install check and the Change check exit 0.
- Closed Changes `01`, `05/01` and `05/02` are still `CHANGE CLOSED` with no problem, with the forms they were sealed in (a single `retro.md`; `retro-work.md` with `retro-observe.md`), and are tested as such.
- A converged round that names other Work, an earlier round converged but a later one with findings, malformed rounds, a gap, an unknown file, a Work sealed with no converged round, a retro before seal, and either historical retro in an open Change are each reported or refused.
- The evaluator, the Node, the Agent Skill and its references contain no hosting, provider or person concept, and no number of agents; tested.

## Choices a Reviewer may test

- The Worker stops with `work/` open, not sealed: sealed Work cannot take findings, and sealing follows convergence. The architecture gives the reasons.
- This Change is allocated `01` of today's date, because the number is per day.
- The Worker's own state when it stops is `WORK OPEN`, next: have it reviewed, naming the identity the Reviewer must write in round `01`.

## Not shown

- That the Reviewer is independent of the Worker, or that the review is good: no check can.
- That the realization outside `work/` is what this Work describes: that is the Reviewer's judgment.
