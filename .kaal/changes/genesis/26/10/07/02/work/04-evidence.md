# Evidence

What this Change realized, and where a Reviewer can read it. The realization lives outside `work/`; this file says what to read and what was shown.

## Realized

- `packages/kaal-changing/kaal/ROWING.md` and its seal: a KAAL Definition typed by the `KAAL Definition` Node, delivered beside `RATIFICATION`. The Changing KAAL Node, RATIFICATION, Core and every existing seal are byte-for-byte as they were.
- `packages/kaal-changing/skills/kaal-changing/`: `SKILL.md` (process with review, steps, rules), `references/rowing.md` (new: the 2+1 roles, what ROWING asks of a round, the form of a round, iteration, separation) and `references/retro.md` (the three retrospectives, `retro-work.md`, `retro-review.md` and `retro-owner.md`, and the historical forms). The installed projection under `skills/` and `.kaal/skills/` is derived by the installer.
- `engineering/change-seal/helpers/process.ts` (the one evaluator), with `changes.ts` and `cli.ts`: rounds, the new stages, the sealing and closing preconditions (a converged review of the sealed Work and all three retrospectives), the historical forms, and the `work:` line that `state` prints.
- Acceptance: `engineering/change-seal/acceptance/process.test.ts`, `engineering/kaal-changing/acceptance/delivery.test.ts`, `engineering/kaal-install/acceptance/install.test.ts`, `packages/kaal-changing/test/package.test.ts`, and the READMEs of the three engineering directories and the package.

## Shown

- The full test run passes, and the seal check, the install check and the Change check exit 0.
- Every Change closed on `kaal/genesis` before this one (`01`, `05/01`, `05/02`, `05/03`, `06/01` to `06/09` and `07/01`) is still `CHANGE CLOSED` with no problem, with the forms it was sealed in (a single `retro.md`; `retro-work.md` with `retro-observe.md`), and is tested as such.
- A converged round that names other Work, an earlier round converged but a later one with findings, malformed rounds, a gap, an unknown file, a Work sealed with no converged round, a retro before seal, fewer than three retrospectives, and the single `retro.md` in an open Change are each reported or refused.
- The evaluator, the Node, the Agent Skill and its references contain no hosting, provider or person concept, and no number of agents; tested.

## Choices a Reviewer may test

- The Worker stops with `work/` open, not sealed: sealed Work cannot take findings, and sealing follows convergence. The architecture gives the reasons.
- This Change was staged as `06/01`, `06/02` and `06/03` while other Changes were admitted first, and is now `07/02`, the first free number after the admitted lineage (through `07/01`); the staged Change moved whole each time, and its dependency (the bridge, `06/02`) has landed.
- The Worker's own state when it stops is `WORK OPEN`, next: have it reviewed, naming the identity the Reviewer must write in round `01`.
- The Owner's retrospective is `retro-owner.md`, named for the role. `retro-observe.md` is historical terminology from before the outer seat was understood to be the Owner's; it is kept in closed Changes exactly as sealed and is reported, not accepted, in an open one, so no Observer role is implied.

## Review round 01

`review/01.md` (findings, against Work `fdd24ead…`) raised two findings, resolved in the Work and its realization:

1. **The Intent is the fixed target.** Intent (new section "The outer loop"), R5 and R16, Architecture (the outer loop in "The process"; Q12), `references/rowing.md` (roles, iterating) and `SKILL.md` (the Worker step and a rule) now say that neither the Worker, the Reviewer nor the Owner inside the loop revises the Intent, that an undeliverable Intent leaves the Change unconverged as a success, and that what the Owner then does is outside the Change. Tested in `engineering/kaal-changing/acceptance/delivery.test.ts`.
2. **Retro state is not tied to a privileged seat.** Resolved as an any-order, symmetric state `RETROS INCOMPLETE`; round 02 corrected that instruction (below), so that model is gone and the stages follow the order of WORK.

## Review round 02

`review/02.md` (findings, against Work `5ce0e92b…`) says round 01's fixed-Intent correction stands and corrects the any-order retrospective instruction: after the Work is sealed, retrospective learning is ordered, and a later retro may read the earlier ones. Resolved in the Work and its realization:

- **WORK** names that ordered discipline beside ROWING: `Worker → Owner → Reviewer → Knowledge`, in Intent (new section "ROWING and WORK"), R2, R8, R10 and new R17, Architecture (the lifecycle, record, stage table, Q4, Q16 to Q19, Q21, Q23, Q25), the Skill (`SKILL.md` steps 5 to 7, `references/rowing.md`, `references/retro.md`) and the READMEs. Round 03 then birthed WORK as a Node (below); there is no role or status file.
- **The evaluator** (`engineering/change-seal/helpers/process.ts`) requires `retro-work.md`, then `retro-owner.md`, then `retro-review.md`: stages `WORK SEALED`, `RETRO-WORK PRESENT`, `RETRO-OWNER PRESENT`, `RETROS PRESENT`; the next step is the first missing one in order; a retro present before an earlier one is a reported problem; closing needs all three. Tested in `process.test.ts` and `admission.test.ts`.
- **The Owner's judgment** against the fixed Intent happens after the Work seal and the Worker's retro, is no artifact, and encodes no approval or verdict anywhere; `retro-owner.md` follows it and carries none. A host's authorization or admission of the closed Change is outside KAAL and not mentioned beyond saying so.
- The Intent stays fixed (round 01). Historical forms are unchanged.

## Review round 03

Kai's answer to the design question, treated as a finding and design resolution while the Work is mutable (not convergence, no review round file yet): WORK is the same semantic class as ROWING and RATIFICATION, so it is born as a sealed KAAL Definition in `packages/kaal-changing/kaal/`, minimal as ROWING is.

- **`WORK.md`** (typed by KAAL Definition, sealed by its own bytes `dc41786d…`, delivered beside the others, installed under `.kaal/skills/kaal-changing/`): the mnemonic W Worker, O Owner, R Reviewer, K Knowledge, and the durable constraint that sealed Work becomes Knowledge through perspectives in that fixed order, each later one drawing on the earlier, none revising the Work or the Intent, Knowledge not being approval. No filename, evaluator stage, host, GitHub, account or CI.
- **The Skill** keeps describing how the current process realizes it and does not redefine it.
- **Acceptance**: the payload and admission tests count and seal WORK; a new test shows it typed by the exact KAAL Definition Node and free of host, filename, stage and relationship text.
- Not done, as instructed: Work sealed, retrospectives, converged round.

## Not shown

- That the Reviewer is independent of the Worker, or that the review is good: no check can.
- That the realization outside `work/` is what this Work describes: that is the Reviewer's judgment.
