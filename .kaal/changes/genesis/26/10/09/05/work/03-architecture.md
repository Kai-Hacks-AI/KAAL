# Architecture: the minimum within `kaal-review`

## Decision

`kaal-review` gains two small sealed **KAAL Definitions**, `HOW` and `ARE`, delivered in `packages/kaal-review/kaal/` beside `Review` (as `ROWING`, `WORK` and `RATIFICATION` are delivered beside `Changing KAAL`), and a short **Way of Working** section in the Agent Skill. `Review.md`, its seal, `review.mjs` and the round form are untouched. Core, CASE, `.github` and #75 are untouched.

**Which, and why** (the default asked for: prefer a Way of Working addition unless a fresh Agent cannot discover the meaning without a Node): the *conduct* is Way of Working and stays there. The *meaning* is a Node because (a) a Process has to cite it by `{name, id}` and is forbidden to redefine it; (b) KAAL's meaning is read from Nodes, not from unsealed Agent Skill text; (c) Review cannot be amended without breaking the ID #75 composes. One Node per acronym was not assumed: WE, DOING and TOGETHER get none (below), and HOW and ARE are two Nodes only because they are two different questions asked of a review (who takes part; who examines and with what independence) and a Process may require one and not the other.

## HOW

Review, as Review defines it, with a human taking part while it happens (interaction with the review, not reading a finished record): observes the result as it stands and the examination, is shown each finding as found, and can direct the review. Agents may assist (run checks, carry evidence, relay, keep the record) but an assisting agent is not the human observing; a review in which no human observed the result as it stands is not HOW. It adds **no authority**: not approval, and not establishing, accepting or executing the result. The examiner still holds the seat under Review's authority and independence; a human present does not excuse a non-independent examiner. A HOW round says in plain words that a human took part and what they observed of the identity the round names: inspectable, not proof (Review's own limit). It says nothing about who the human is, which account, which channel, whether the examining is by the human, an agent or both, nor when HOW is required.

Departure from the historical Idea: HOW's Idea separates "the Human" from "the Owner". Current KAAL's Changing KAAL speaks of the Owner as the human who grants authority. HOW therefore says *a human* and neither identifies the human with the Owner nor separates them; who the Owner is stays where it is defined.

## ARE

Review, as Review defines it, in which an agent examines the result of another actor and reports without needing a human in the ordinary course. "Each-other": any agent may review another's result and have its own reviewed by a different one. It is ARE when the examiner is an agent, is not the maker, and its judgment was not supplied, selected or steered by the maker; a helper the maker starts on its own side is part of the maker (07/07, 07/08). Independence is of **judgment, not of product**: a different model, provider, tool, account or context neither establishes nor is needed for independence, more examiners is not better, and nothing measures independence. The statement is inspectable, not proof; an examiner that cannot make it truthfully reports no convergence. ARE needs no human in a round; a human may read the record, and reading it afterwards does not make a round HOW; a human who takes part while the review happens and can respond to its findings makes those rounds HOW as well. It grants no authority and convergence among agents is not approval. It does not choose the examiner or say when ARE suffices.

## Way of Working (Agent Skill `kaal-review`, unsealed)

- `description` names HOW and ARE so a host's skill index matches "HOW Review of PR75 please".
- A section "When asked for HOW or ARE": read the Node; identify the result and its exact identity from the asker or host; check your seat (not the maker, not started by the maker, else stop); for HOW keep the human in the review as it happens and never write their observation, direction or approval as theirs; for ARE examine and write the round with the independence statement, and stop (not ask a human to stand in) if you cannot make it; what follows (findings, where the round goes, approval) is the asker's.
- A rule: a round is transient evidence, not knowledge; Review keeps no store of observations.
- No new script, field, schema, role, record or Node-reading machinery. `review.mjs` and the evaluator that reads two lines of a round are unchanged.

## Boundaries preserved

- **Review**: examines, reports findings or convergence. Gains no authority over approval, establishment or execution.
- **Processes**: determine when ARE suffices or HOW is required (Agreement's escalation does this); they compose Review and may cite HOW and ARE by `{name, id}`, and neither redefines them. #75's Node `Agreement` uses HOW in words and is not altered; it can adopt the reference in its own Change. HOW/ARE name no Process, so #75's and any later Process's order is theirs.
- **Learning/BRAIN/Retro**: durable experience is theirs. The review side says only that a round is transient.
- **Core**: untouched; HOW and ARE are ordinary Nodes found by type and name.

## Deliberately deferred

- **WE and DOING**: not birthed. They describe retention, which is `kaal-learning`'s realization (Change 08/04 design merged). CEIL belongs there. If a Learning is ever born from review experience, it is established through that capability by a Change.
- **TOGETHER WE CAN GO FAR**: not birthed; see `02-investigation.md`. Recorded here as provenance with its caveat (restored from recollection).
- **The Human/Owner distinction** of the historical Idea; **formal positions** (Owner, Worker, Reviewer as Review concepts); **quorum, independence measurement, required model diversity**; **approval points**. The Idea itself leaves all of them open.
- **Whether a round records HOW or ARE** in a field (`review.mjs`/`change-state`): not done; the statement carries it in words, and no check can know who took part.
- **Installing optional Skills by default** (raised in #76): not here.

## Open forks (recommendation first)

1. Two Nodes `HOW`, `ARE` (recommended), or one combined Node, or Way of Working only. Way of Working only fails reasons (a) to (c) above; a combined Node would import the historical bundle.
2. Should `HOW`/`ARE` be sealed in this PR? Recommended yes (they are born after Review and tests require each shipped Node to carry its seal); the seals are on the branch only and can be redone while it is unmerged if the wording changes.
3. Should #75's `Agreement` cite HOW by `{name, id}`? That is #75's Change to make once these merge; this one does not touch it.
4. Is WE (retention) wanted as an explicit pointer in Review's Skill to a future Learning Skill? Not now: naming a capability that has no Node would break born-before.
