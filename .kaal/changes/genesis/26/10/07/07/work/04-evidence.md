# Evidence

Against the fixed Intent (Owner's decisions 1 to 4) and Requirements R1 to R9.

- **R1, R2, R3, R5, R8:** `references/rowing.md` "Seats, authority and the turn" states the turn/seat/capability rule, bounded delegation never inferred from capability, Worker/Reviewer separation, the stop on an empty seat, and the current setup as one realization. `SKILL.md` step 3 and the Handoff section say the same by pointing there.
- **R4:** the same section states what the Worker may do toward an assigned Reviewer (deliver, request, respond, including prompting or resuming) and may not (assign, select, control); a Worker-started helper is part of the Worker unless the Owner's authority assigned it, and its output is Work evidence.
- **R6:** the round form gains a `## Reviewer` section stating, in plain words, under whose authority the seat is occupied; no schema; a Reviewer unable to state it does not write `converged`. The evaluator is unchanged and still reads only the `Work` and `Result` lines.
- **R7:** "with weaker independence", "its separation is only weaker", "Do not switch actors merely to look independent" and "Worker and Reviewer in separate contexts" no longer appear in either file; the new delivery test asserts their absence.
- **R9:** changed files are the Agent Skill, `references/rowing.md`, their installed projection (`skills/kaal-changing`, regenerated with `npm run install-kaal`), one acceptance test, and this Change's `work/`. `ROWING`, `WORK`, all Nodes and seals, Core, `.github`, `retro.md` and the evaluator are untouched.
- **#65 situation:** step 3 now reads that with Work ready and no authorized actor in the Reviewer seat, the Worker says the seat is empty and waits; it may not fill it with a helper it starts. With an Owner grant to an orchestrator, the Skill reads the same mechanics as legitimate.

Run: `npm test` (all workspaces: 59, 6, 18, 40 passing, 0 failing, including the new test), `check-kaal-seals`, `check-kaal-config` and `check-kaal-install` exit 0; `state-kaal-change` reports WORK OPEN with no problems.

What no check shows: that the stated authority is true, and that the separation of judgment held. The Reviewer's own statement is for the Owner to inspect.
