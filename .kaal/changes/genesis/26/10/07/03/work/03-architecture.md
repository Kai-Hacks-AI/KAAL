# Architecture

## Reading

The friction was not a missing step. The process already orders every act. What failed was that the Agent Skill, read literally, ends a stage with "stop" and does not say whose authority an act rests on, so an actor cannot tell a legal next act from one it must ask about. The record also cannot show who wrote a file, so no check can carry authority either.

## Decision

The smallest thing is a statement, not machinery: the Agent Skill of Changing KAAL says what the handoff is, what a transition is not, where the real boundaries are, and what may be carried after each. No Node, artifact, evaluator change or metadata is added (R9).

- The **handoff** is the described Intent itself, given to the Worker. It is not a second artifact and not bound to any file: the Work record represents the Intent, and whether a stage is one file, a directory of artifacts or another adequate representation is left open. The described Intent, handed to the Worker, is what is authoritative.
- **Continuation** is stated per role in the Skill's steps. The Worker's step no longer ends in a stop; it ends where Review is actually needed. The steps after the Owner's act name what the remaining holder of the Reviewer role does through closure.
- **Boundaries** are three, stated once: Owner decisions (judgment of the Work, `retro-owner.md`, what to do with an undeliverable Intent), Review when the process requires it, and host admission. Where Review falls within the progression is deliberately left open; the Skill states only that a finished stage is not a handoff.
- `references/rowing.md` carries the same distinction in its roles section: boundaries are ordered knowledge boundaries, not permission requests.

## Considered and not chosen

- **A handoff artifact** (a file saying "authorized to continue"). It would be a status file under another name, and an actor could write it for itself. The described Intent already is the handoff.
- **A permissions model or protocol.** KAAL's checks see artifacts and order, never who wrote them, so none could enforce it; it would assert authority without being able to show it.
- **A new Node.** WORK and ROWING already carry the meaning that matters: order of perspectives, and review discipline. Nothing here is a new semantic birth.
- **Evaluator changes.** The evaluator's next-step text already names legal acts and carries no stop. It is not the source of the friction.
- **Making the Reviewer a different actor.** That manufactures independence. It stays recommended, and a Change reviewed by the same actor says so in the way it already may.

## Where it lands

Only the Agent Skill of `packages/kaal-changing`: `SKILL.md` (steps 2, 3, 4, 5, 6, 7 and a section on handoff and continuation) and `references/rowing.md` (roles) and `references/retro.md` (a pointer on carrying the Owner's text). The host projection under `skills/` follows through the repository's installer. Nothing under Core and no sealed file is touched.

## Resolved in Review round 01

The Owner's judgment has no artifact by design, so an actor can know the Owner has acted only from the Owner's own text, `retro-owner.md`, being present. Step 6 is the one stop until it arrives, and continuation rests on it. A converged round hands the Change onward to the Worker role for sealing and `retro-work.md`, whoever the actors are.
