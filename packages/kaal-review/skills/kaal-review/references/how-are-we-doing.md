# HOW ARE WE DOING?: historical provenance

**Status: provenance. This file defines nothing.** The authoritative meanings are the Nodes `HOW` and `ARE` of the installed KAAL, found through `Review`. `WE` and `DOING` are not established in current KAAL and are not a capability, a Node or a Skill. The whole phrase, `HOW ARE WE DOING?`, is not established either. This file keeps the complete original Idea so that a future Agent does not have to search the old repository to reconstruct it, and so that it is not mistaken for current architecture.

## Where it comes from

The Idea was recorded in the historical repository `Kai-Hacks-AI/KAAL-genesis` as `ideas/how-are-we-doing/idea.md`, in pull request #65 (merged 2026-09-29, commit `cfc110c6a8497821e99ef425b2ce1023ff72fccd`). It was recorded as a possibility, with provisional wording, from the evidence of how KAAL itself had been developed. The branches of that repository are deleted; read the file by that commit. It was never a Requirement or a Review capability there.

## The mnemonic

```
HOW     Human Observes Work
ARE     Agents Review Each-other
WE      With Experience
DOING   Durable Observations Inform Next Goals
```

The wording was provisional there: the meaning matters more than the acronym, and the acronym is not to be completed or made grammatical by distorting what it names.

## The combined meaning

It describes one feedback loop, not a review procedure. Work stays observable to a human, who steers where human judgment or authority is valuable without performing or verifying every operation. Agents other than the one that produced the work challenge it, independently tasked. What those reviews find is not left in the pull request: the observations that matter become durable, in the place that owns their meaning, and so later work begins with experience that earlier work had to discover. Without that retention, a loop of producer, reviewer, repair and next task can rediscover the same classes of failure indefinitely.

- **HOW** was not "generic human in the loop" and not an attempt to remove the human. Agents carried most of the implementation, execution, review and repair; the human intervened where judgment mattered. It defined no observability and no point where a human must approve.
- **ARE** rested on the observation that the producer of work was not the only judge of it, and that independently tasked review repeatedly found what the producer had not considered. One model in one context can produce work, and an explanation of it, that is coherent and shares the blind spots that produced it. The Idea claimed only that independently tasked review had been useful: not that a different model means independent judgment, and not that more reviewers are better.
- **WE** (With Experience) is what separates the loop from producer, reviewer and repair. Experience is not conversation history and not a new kind of record.
- **DOING** (Durable Observations Inform Next Goals) is the feedback effect. Not every observation deserves to survive: pull request comments, transcripts and CI logs can stay transient. An observation earns durability when its meaning matters beyond the work at hand, and it becomes durable by moving to the owner of that meaning, which the Idea named at the time as BRAIN (what KAAL has learned and means), a Defect, an Idea, a Requirement, a Skill and testing. So it implied no Observation, Experience or Goal record and no memory of everything agents say.

The Idea also described, as supporting evidence and not as architecture, a way of speaking in positions: an Owner (delegated intent, roadmap alignment, acceptance), a Worker (candidate work) and a Reviewer (independent challenge), with the Human outside those positions, observing and directing, and not the Owner. It named the accounts and products that carried the positions as carriers and not meaning; identity, position and Skill were distinct. It left undecided whether those positions become formal, whether reviewing becomes a Skill, quorum, whether different models are required, how independence is measured, which decisions need the human, how observations reach their owners, whether goals become an artifact, and whether any of it becomes a Skill or framework.

## How current KAAL holds it

| Part | Current KAAL |
|---|---|
| HOW | Established as the Node `HOW`: Review in which a human takes part while it happens. It does not separate the human from the Owner; current KAAL speaks of the Owner as the human who grants authority. |
| ARE | Established as the Node `ARE`: Review by an agent independent of the maker, without a human in the ordinary course. |
| WE, DOING | Not established. Retention of experience belongs to the capabilities that own durable knowledge: Retro, and the `kaal-learning` and BRAIN design, which is architecture only so far. Review keeps no store of observations, and a round is transient evidence. |
| The whole loop | Not established, and not to be read as current architecture. It may inform the later learning work. |

## Related Idea: TOGETHER WE CAN GO FAR

The same historical repository holds `ideas/we-can-go-far/idea.md`, as corrected in its pull request #72 (merged 2026-09-29, commit `c7ac6bc3043508755ccf63085f52518a797c190f`). It is a different loop: `TOGETHER` (The Owner Gets Enhanced Through Holistic Experience Reviews), `WE` (Worked Evidence), `CAN` (Changes Adaption Now), `GO` (Getting Optimized), `FAR` (Features Accepted Regression), joining a forward planning and testing loop to a backward loop of evidence, learning and refactoring. Its `TOGETHER` was restored from the Owner's recollection, with no earlier trace in the lineage. Note that both mnemonics use `WE`, with different meanings. It adds no Review meaning here and is not established in current KAAL.
