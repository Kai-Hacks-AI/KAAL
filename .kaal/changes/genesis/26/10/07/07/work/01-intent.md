# Intent

DRAFT, proposed for the Owner. The Intent is the Owner's to describe and fix; nothing here is fixed until Kai says so. While the draft is open pending the Owner's agreement and handoff, nothing is sealed or closed. That is a temporary stop of this alignment surface, not part of the target below: once the Intent is described and handed over, the Change takes the ordinary process, including the Work seal and closure.

A Worker cannot satisfy KAAL's requirement for independent review by establishing, selecting, appointing, spawning or otherwise controlling the actor or authority that judges its Work, or by directing that judgment. Worker produces Work. An independently established Reviewer judges it. The Worker may respond to findings, and may deliver the Intent, the Work, its evidence and review requests to a Reviewer that has already been independently established; the Worker cannot create the authority that supplies the judgment. When the Work is ready for Review and no Reviewer the Worker did not establish is present, the Worker stops and says so.

KAAL defines the independence property. How a host or operating setup realizes it (sessions, subscriptions, accounts, tools, people) is not KAAL's.

## Do

- State the property once, in Changing KAAL's Agent Skill, as a requirement of the process and not a recommendation: a Reviewer is independently established only if the Worker did not establish, select, appoint, start or otherwise control the reviewing actor or the authority that gives it, and does not steer its verdict.
- Make "Review when the process requires it" a named stop with a stated condition: Work ready for Review, and no independently established Reviewer present. The Worker reports that and waits; it does not manufacture one. Say what the Worker may still do: ask for a Reviewer, and, through an Owner-authorized handoff to an already independently established Reviewer, deliver the Intent, the Work and its evidence, make review requests and respond to findings, which may be prompts or resumptions of that Reviewer's session. Delivery is permitted; choosing the Reviewer or steering the verdict is not.
- State that a helper the Worker starts (a subagent, a fresh context, a resumed session) is part of the Worker. Its output is Work evidence, never a round, however separate its context.
- Remove the wording that lets a same-actor Reviewer count: the "weaker independence" parenthesis in step 3, "Do not switch actors merely to look independent" as applied to the Reviewer, and "Recommended: Worker and Reviewer in separate contexts" in `references/rowing.md`. Keep that one actor may hold Worker and Owner-side roles where the process says so; only Worker and Reviewer are separated.
- Ask the Reviewer to state, in its round, in plain words, how it came to hold the role and that the Worker did not establish it. A Reviewer who cannot say so does not write `converged`. This is a statement the Owner can inspect, not a proof.
- Say plainly that KAAL's checks see artifacts and order and cannot establish this; a closed Change does not prove it, and the Owner's inspection of the Reviewer's statement and its path is where it is judged.

## Do not

- Do not define independence as a different subscription, vendor, model or GitHub account, and do not name any of them as the rule.
- Do not tie the meaning to GitHub's PR review feature. A host may provide evidence or an adapter; the meaning stays KAAL's.
- Do not touch the sealed Nodes `ROWING` and `WORK`, Core, `.github`, the evaluator or the seal helpers; do not add writer-identity, role or status metadata.
- Do not redesign the role model, or reopen the stops removed by Change 07/03 for the Owner's own acts. Role boundaries stay knowledge boundaries; this adds one authority boundary, the one that makes review independent.
- Do not modify the Change carried by PR #65 (branch `claude/project-thread-xhwiep`; its address `07/07` is shared with this draft only across concurrent branches), and do not use this Change to repair or re-review it.

## Done when

- A Worker reading the Skill alone, given the situation of PR #65 (Work ready, no Reviewer present), stops and reports that an independently established Reviewer is needed, and does not start one.
- The Skill says in one place who establishes the Reviewer, what the Worker may and may not do toward it, and that a Worker-started helper is not one.
- No text in the Skill or its references still lets a same-actor or Worker-started Reviewer count toward convergence.
- No vendor, model, account or host feature appears as the definition. `npm test`, `check-kaal-seals`, `check-kaal-config` and `check-kaal-install` still pass.

## Open for the Owner

1. Is the Reviewer's plain-words statement of how it came to hold the role wanted in the round, or is Owner inspection of the path enough?
2. Who establishes the Reviewer: the Owner only, or the Owner's operating setup acting for them? The draft says "not the Worker" and leaves the rest to hosts.
3. Same actor holding Worker and Reviewer is currently "valid, weaker". The draft makes that fail the requirement while the evaluator still passes it. Agree?
