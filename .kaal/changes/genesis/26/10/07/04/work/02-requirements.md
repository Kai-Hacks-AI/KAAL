# Requirements

Scope: an agent working a Change of this repository's KAAL, following the `kaal-changing` Skill. The Skill already names the repository's provisional helpers as the way it asks (`npm run state-kaal-change`); delivering the answer to a KAAL installed elsewhere is a separate question, recorded under Not decided.

When asked, the answer is derived from the Change's artifacts and seals alone, nothing is written to say a phase was reached, and it knows nothing of hosts.

1. **Where.** It names exactly one stage of the process: work open, review converged, work sealed, each retrospective present, closed.
2. **What next.** It names the next legal act and the role that holds it (Worker, Reviewer, Owner), so an agent holding a role knows whether the act is its own, without asking anyone.
3. **Review is anchored to the Work.** It prints the identity of `work/` as it now stands. A round that names other Work does not converge this one; only the latest round decides; changing `work/` after a round calls for another round.
4. **Order.** Sealing Work is allowed only on a converged review of exactly that Work. Retrospectives follow a sealed Work in the order Worker, Owner, Reviewer; one out of order or too early is reported, not accepted.
5. **The Owner's act stays the Owner's.** Where the Owner's judgment is next, it says that act is the Owner's and is no artifact; it never presents the Owner's text as something an agent supplies.
6. **Invalid and stale records.** A problem is reported with a non-zero exit. When a sealed record (sealed Work, sealed Change) was altered or removed, it takes precedence over the order: `next` says to restore it, and does not instruct the agent to proceed as if the Change were merely open.
7. **Closed means sealed.** A closed Change is judged by its own seal, in whatever historical form it was sealed.
8. **Deterministic.** The same artifacts give the same answer.

## Not decided

Whether and how an installed `kaal-changing` answers outside this repository, where the repository's helpers are absent. The Skill states the helpers are provisional and ships no script for sealing or state; changing that moves the evaluator out of engineering and is Kai's call.
