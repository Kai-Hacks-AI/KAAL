# Intent

Fixed by the Owner on PR #66 (comment of 2026-10-07, after review round 03) and handed to the Worker. The Worker neither owns nor revises it.

The authority to establish a Reviewer is granted, never inferred from technical capability. The human Owner has a voice in establishing the operating arrangement and in delegating authority. KAAL defines the roles, their responsibilities and the separation of judgment they require; provider adapters realize capabilities under that arrangement. Claude, Codex, GitHub and any other provider are peers in this respect: none acquires governance authority because it can spawn agents, review code or merge a PR.

**Process determines the turn. Authority assigns the seat. Provider capability executes the work.**

The Owner's decisions:

1. **Grant provenance.** Each Reviewer states in plain language under whose authority it occupies the Reviewer seat. No mandatory machine-readable schema.
2. **Delegation.** The human Owner may delegate seat assignment to an orchestrator. Further delegation is permitted only within the authority explicitly granted; it is never inferred from provider capabilities.
3. **Seat separation.** An actor does not occupy both Worker and Reviewer seats for the same Change merely because it can perform both jobs. An authorized orchestrator may assign distinct actors, but orchestration does not erase the separation of judgment.
4. **Handoff.** ROWING identifies which seat acts next and what it must do. If no authorized actor occupies that seat, the process stops and identifies the missing seat rather than silently substituting another actor.

The current two-subscription setup is one realization, not a KAAL requirement.

## Scope

Changing KAAL's and ROWING's instructions (the Agent Skill and `references/rowing.md`, and their installed projection) and the handoff behaviour they need. Not a generic orchestration framework, a scaffold redesign or provider-specific enforcement. Independent review remains a separate seat after Work.

## How this answers PR #65

The Worker there held an Agent tool, started a subagent, prompted and resumed it, and recorded its output as Reviewer rounds. No seat assignment existed; the Worker inferred the entitlement from the tool. Under this Intent it stops at "Work ready for Review" and reports that the Reviewer seat is empty. Had the Owner authorized an orchestrator to assign distinct Worker and Reviewer actors, even on one provider, the same mechanics would have been legitimate.

## Do not

- Do not define independence as a different subscription, vendor, model or account, and do not ban an agent from assigning another actor when the Owner's authority allows it.
- Do not give any provider, tool or host feature governance authority by virtue of its capability.
- Do not touch the sealed Nodes `ROWING` and `WORK`, Core, `.github`, the evaluator or the seal helpers; add no writer, role, grant or status metadata and no machine-readable schema.
- Do not redesign the role model or reopen the Owner-side stops removed by Change 07/03.
- Do not modify the Change carried by PR #65 (branch `claude/project-thread-xhwiep`; its address `07/07` is shared with this Change only across concurrent branches).
- Do not seal or close the Work without the ordinary process.

## Done when

- A Worker reading the Skill alone, given PR #65's situation (Work ready, an Agent tool at hand, no seat assigned), stops and names the empty Reviewer seat, and does not fill it.
- Given an Owner grant to an orchestrator to assign distinct actors on one provider, the Skill reads that arrangement as legitimate.
- The Skill states in one place who assigns seats, that delegation is bounded by what was granted, what the Worker may and may not do toward the Reviewer, and that a Worker-started helper is part of the Worker unless the Owner's authority assigned it.
- No text still lets a same-actor Reviewer, or a seat the Worker filled for itself, count toward convergence.
- No vendor, model, account or host feature is a definition. `npm test`, `check-kaal-seals`, `check-kaal-config` and `check-kaal-install` pass.
