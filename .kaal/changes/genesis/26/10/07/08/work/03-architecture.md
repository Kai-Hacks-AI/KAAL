# Architecture

Wording in the two places that already carry the roles, with the detail stated once.

- `references/rowing.md` gains the section "Seats, authority and the turn" (R1 to R6, R8), a `## Reviewer` section in the round form, and a rewritten "Separation" section and Reviewer role entry (R7). Its introduction keeps that one actor may hold several roles, except the Worker and Reviewer seats of one change.
- `SKILL.md` points to it: step 3 becomes the stop and the Reviewer's statement (R5, R6); step 2 forbids the Worker filling the seat; the Handoff section replaces "independence is asked only where it means something" and "do not switch actors merely to look independent" with the turn/seat/capability rule and the Worker/Reviewer separation; the Rules replace "one actor may hold several roles; the process stays valid, only weaker" with the Worker-helper rule and what the checks cannot show.
- The installed projection under `skills/kaal-changing` is regenerated with `npm run install-kaal`.
- One acceptance test in `engineering/kaal-changing/acceptance/delivery.test.ts` proves R1 to R8 on what is shipped.

Not changed: `ROWING`, `WORK` and every Node and seal, Core, `.github`, the evaluator (`change-state.mjs`, `engineering/change-seal`), `retro.md`. The evaluator cannot see actors or authority; the round's statement is for the Owner to inspect.

## Alternatives rejected

- Banning a Worker-started Reviewer outright: contradicts the Owner's correction, since an authorized orchestrator may assign Worker and Reviewer through one provider.
- A grant artifact or schema: ruled out by the Owner; a plain statement in the round suffices.
- Evaluator enforcement: checks cannot see actors, and provider-specific enforcement is out of scope.
