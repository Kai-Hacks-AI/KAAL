# Architecture

## Reading

The friction was not a missing step. The process already orders every act. What failed was that the Agent Skill, read literally, ends a stage with "stop" and does not say whose authority an act rests on, so an actor cannot tell a legal next act from one it must ask about. The record also cannot show who wrote a file, so no check can carry authority either.

## Decision

The smallest thing is a statement, not machinery: the Agent Skill of Changing KAAL says what the handoff is, what a transition is not, where the real boundaries are, and what may be carried after each. No Node, artifact, evaluator change or metadata is added (R9).

- The **handoff** is the described Intent itself, held as `work/01-intent.md`. It is not a second artifact: an Intent the Owner has described and given to the Worker is the authority to work.
- **Continuation** is stated per role in the Skill's steps. The Worker's step no longer ends in a stop; it ends where Review is actually needed. The steps after the Owner's act name what the remaining holder of the Reviewer role does through closure.
- **Boundaries** are three, stated once: Owner decisions (Intent, judgment of the Work, `retro-owner.md`), Review when the process requires it, and host admission. Where Review falls within the progression is deliberately left open; the Skill states only that a finished stage is not a handoff.
- `references/rowing.md` carries the same distinction in its roles section: boundaries are ordered knowledge boundaries, not permission requests.

## Considered and not chosen

- **A handoff artifact** (a file saying "authorized to continue"). It would be a status file under another name, and an actor could write it for itself. The described Intent already is the handoff.
- **A permissions model or protocol.** KAAL's checks see artifacts and order, never who wrote them, so none could enforce it; it would assert authority without being able to show it.
- **A new Node.** WORK and ROWING already carry the meaning that matters: order of perspectives, and review discipline. Nothing here is a new semantic birth.
- **Evaluator changes.** The evaluator's next-step text already names legal acts and carries no stop. It is not the source of the friction.
- **Making the Reviewer a different actor.** That manufactures independence. It stays recommended, and a Change reviewed by the same actor says so in the way it already may.

## Where it lands

Only the Agent Skill of `packages/kaal-changing`: `SKILL.md` (steps 2, 3, 5, 6, 7, 8 and a short section on handoff and continuation) and `references/rowing.md` (roles). The host projection under `skills/` follows through the repository's installer. Nothing under Core and no sealed file is touched.

## Open to Review

Whether the Skill wording is enough to carry the test, or whether one more explicit thing is needed (the Owner's authority has no artifact by design, so continuation after it rests on the Owner's text being present, not on a record of a go).
