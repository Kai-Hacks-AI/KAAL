# Requirements

R1. **The turn.** The Skill states that the process names which seat acts next and what it must do, and not who the actor is.

R2. **Authority.** The Skill and `references/rowing.md` state that a seat is occupied by an actor assigned under authority explicitly granted by the Owner or delegated by the Owner to an orchestrator; delegation is bounded by what was explicitly granted and is never inferred from provider capability.

R3. **Separation.** One actor does not hold the Worker and Reviewer seats of the same change merely because it can do both jobs. An authorized orchestrator may assign distinct actors, through one provider or several; orchestration does not erase separation of judgment.

R4. **The Worker toward the Reviewer.** The Worker may deliver the Intent, Work, evidence and review requests to an assigned Reviewer and respond to findings, including by prompting or resuming it. It may not assign, select or control it. A helper acting on the Worker's side without an assignment to the Reviewer seat is part of the Worker, and its output is Work evidence, never a round. A distinct actor assigned to the Reviewer seat under the Owner's authority writes rounds under that grant, even when the Worker prompts or resumes it.

R4a. **After convergence.** Sealing the Work and writing `retro-work.md` are the Worker's, who is never the same actor as the Reviewer.

R5. **The stop.** When Work is ready for Review and no authorized actor occupies the Reviewer seat, the process stops, names the missing seat, and does not substitute another actor.

R6. **Provenance.** Each round states in plain words under whose authority the Reviewer occupies the seat. No schema; the evaluator is unchanged. A Reviewer that cannot state it does not write `converged`.

R7. **Removed.** No text lets a same-actor Reviewer count, recommends separate contexts as separation, or says to avoid switching actors for looks.

R8. **Neutral.** No vendor, model, account or host feature defines any of this; the current operating setup is named as one realization only.

R9. **Scope.** Only the Agent Skill, `references/rowing.md`, their installed projection and their delivery tests change.
