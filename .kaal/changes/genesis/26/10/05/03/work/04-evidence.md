# Two-agent retrospective independence: what was made, and how it was checked

The design is carried out in this same Change, as wording only.

## What changed

- Changing KAAL's Skill (`SKILL.md`) and its retro reference: the process now names the handoff, the state `RETRO-WORK PRESENT` (Work sealed, `retro-work.md` present, no `retro-observe.md`). The worker's last step is `retro-work.md`, followed by an explicit stop. The worker does not write `retro-observe.md`, does not produce it through a sub-agent or any other part of its own execution, and does not close the change.
- The next actor to occupy the observer seat must be independent: it must not have participated in the work or in the worker's execution. How an actor comes to occupy the seat is stated as outside KAAL, and the text names no selection or orchestration.
- A section for the observer states its role (not the worker, not an approver), input (the sealed Work and `retro-work.md`), output (exactly `retro-observe.md`, in the retro form), and that it changes nothing else. A defect it finds is recorded in its retro and does not reopen the change.
- The observer's text is incorporated unchanged in substance before the Change is sealed.
- Two rules: a fresh context is not an independent observer (a retro written by a sub-agent that came out of the worker's own execution does not meet the process), and independence is required by the process and cannot be proved by KAAL's checks.
- The evaluator's next-step message for `RETRO-WORK PRESENT` now names the handoff. Its stages, its order, its seals and closure are unchanged.

## What did not change

No Node, no Core change, no new seal, no new metadata, no change to the retro form, no change to closure or to Change identity. The installed projection of the Skill is the repository's own installer's output.

## Checks

- Acceptance for Changing KAAL's delivery gained two tests: that the Skill states the handoff, the worker's stop, the observer's role/input/output, unchanged-in-substance incorporation and the two rules; and that neither the Skill nor the retro reference describes the observer as selected, assigned or orchestrated.
- The evaluator's acceptance expects the new message; its stages and refusals are otherwise untouched.
- The whole test suite and the install and seal checks pass.

## Open

Whether `retro-work.md` should also be frozen deterministically at the handoff stays an operational choice here (architecture, Q1, option A), not built.
