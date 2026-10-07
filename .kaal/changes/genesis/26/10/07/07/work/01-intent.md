# Intent

DRAFT, proposed for the Owner. The Intent is the Owner's to describe and fix; nothing here is fixed until Kai says so. While the draft is open pending the Owner's agreement and handoff, nothing is implemented, sealed or closed. That is a temporary stop of this alignment surface, not part of the target below: once the Intent is described and handed over, the Change takes the ordinary process, including the Work seal and closure.

Revised after the Owner's conceptual correction (PR #66, comment of 2026-10-07): the rule is about granted authority, not about who can spawn whom.

The authority to establish a Reviewer is granted, never inferred from technical capability. A human, as Owner, has a voice in establishing the operating arrangement and in delegating authority. KAAL defines the roles, their responsibilities and the separation of judgment they require; provider adapters realize capabilities under that arrangement. Claude, Codex, GitHub and any other provider are peers in this respect: none acquires governance authority because it can spawn agents, review code or merge a PR.

So a Worker cannot satisfy the requirement for independent review by establishing the Reviewer of its own Work on the strength of a capability it holds (an Agent or subagent tool, a second session, an account). That is an inference, not a grant. The Worker may deliver the Intent, the Work, its evidence and review requests to a Reviewer that was established under a grant, and respond to findings; it cannot supply the judgment or direct the verdict. When Work is ready for Review and the Worker holds no grant naming a Reviewer arrangement, and none is present, the Worker stops and says so.

A grant may be broad. The Owner may authorize an orchestrator to establish Worker and Reviewer, through one provider or several, provided the arrangement preserves the required separation of judgment: the Reviewer's judgment is not supplied, selected or steered by the Worker whose Work it judges. KAAL does not ban delegated orchestration and does not hard-code any operating setup, including today's two-subscription one.

## How this answers PR #65

The Worker there held an Agent tool, started a subagent, prompted it, resumed it and recorded its output as Reviewer rounds. No grant existed; the Owner had delegated no authority to establish a Reviewer, and the Worker inferred the entitlement from the tool. Under this Intent the Worker would have stopped at "Work ready for Review" and reported that it holds no grant. Had the Owner instead authorized an orchestrator (even one running on the same provider) to establish Worker and Reviewer with separate judgment, the same subagent mechanics would have been legitimate, because the authority was granted and the Worker was not the source of it.

## Do

- State in Changing KAAL's Agent Skill (and `references/rowing.md`), as a requirement and not a recommendation: authority to establish a Reviewer comes from an explicit grant by the Owner (or by a party the Owner has authorized to grant it), and is never inferred from a capability, a tool, a session or a provider. A Worker cannot grant itself this authority.
- State what a grant must make clear, in plain words and without a prescribed form: who granted it, that the Reviewer's judgment is not supplied, selected or steered by the Worker, and that the arrangement is not the Worker's own to change. KAAL names no vendor, model, account, subscription or host feature.
- Make "Review when the process requires it" a named stop with a stated condition: Work ready for Review, and no Reviewer established under a grant is present and no grant lets the Worker's orchestrator establish one. The Worker reports that and waits. It does not manufacture a Reviewer from its own capabilities.
- Allow, expressly, that under such a grant an orchestrator (a person, or an agent the Owner authorized, on any provider) establishes the Reviewer, and that the Worker then delivers the Intent, Work, evidence and review requests and responds to findings, including by prompting or resuming that Reviewer's session. A Worker-started helper without such a grant is part of the Worker; its output is Work evidence, never a round.
- Remove the wording that lets a same-actor Reviewer count: the "weaker independence" parenthesis in step 3, "Do not switch actors merely to look independent" as applied to the Reviewer, and "Recommended: Worker and Reviewer in separate contexts" in `references/rowing.md`. Separation of judgment under a grant, not separation of context, is what is asked.
- Ask the Reviewer to state in its round, in plain words, under what grant it holds the role (who granted it, how it was established). A Reviewer who cannot say so does not write `converged`. This is a statement the Owner can inspect, not proof.
- Say plainly that KAAL's checks see artifacts and order and cannot establish a grant or the separation; a closed Change does not prove them.

## Do not

- Do not define independence as a different subscription, vendor, model or GitHub account, and do not ban an agent from establishing another agent when it has been granted that authority.
- Do not give any provider, tool or host feature (spawning, reviewing, merging, PR review) governance authority by virtue of its capability. The meaning is KAAL's; hosts and adapters supply evidence or mechanisms.
- Do not touch the sealed Nodes `ROWING` and `WORK`, Core, `.github`, the evaluator or the seal helpers; do not add writer-identity, role, grant or status metadata.
- Do not redesign the role model, or reopen the stops removed by Change 07/03 for the Owner's own acts. Role boundaries stay knowledge boundaries; this adds one authority boundary, the granted authority to establish the Reviewer.
- Do not modify the Change carried by PR #65 (branch `claude/project-thread-xhwiep`; its address `07/07` is shared with this draft only across concurrent branches), and do not use this Change to repair or re-review it.

## Done when

- A Worker reading the Skill alone, given the situation of PR #65 (Work ready, an Agent tool at hand, no grant), stops and reports that it holds no grant to establish a Reviewer, and does not start one.
- A Worker reading the Skill alone, given an explicit Owner grant to an orchestrator to establish Worker and Reviewer on one provider, understands that arrangement as legitimate and proceeds within it.
- The Skill says in one place that authority to establish a Reviewer is granted and not inferred, who can grant it, what the Worker may and may not do toward the Reviewer, and that a Worker-started helper without a grant is not one.
- No text in the Skill or its references still lets a same-actor Reviewer, or one the Worker established without a grant, count toward convergence.
- No vendor, model, account or host feature appears as the definition. `npm test`, `check-kaal-seals`, `check-kaal-config` and `check-kaal-install` still pass.

## Open for the Owner

1. Is the Reviewer's plain-words statement of its grant wanted in each round, or is Owner inspection of the path enough? (Round 01 and 02 recommend keeping it.)
2. May the Owner delegate the power to grant (an authorized orchestrator granting further), or does a grant always trace to the Owner directly? The draft allows "a party the Owner has authorized to grant it" and requires the grant to name who granted.
3. A Worker acting as its own Reviewer is today "valid, weaker". The draft makes that fail the requirement while the evaluator still passes it, since checks cannot see actors or grants. Agree?
