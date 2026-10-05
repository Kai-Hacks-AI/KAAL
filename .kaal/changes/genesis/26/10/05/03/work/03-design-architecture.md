# Two-agent retrospective independence: architecture

Independence of the observer is established by how the Change is carried out, using existing concepts, and stated honestly as such. KAAL's deterministic checks stay as they are, beyond one open point.

## Roles are Agent instructions, not identities

An Agent in KAAL is a Bare agent steered through instructions, and a Skill specifies desired behaviour for a kind of work. The worker and the observer are therefore not two new kinds of thing. They are the same kind of Agent, steered by two different steps of the Changing KAAL Skill, in two contexts. Nothing identifies the actors, because nothing needs to: the instructions create the seat, and the separation is that the second seat is occupied by an agent that took no part in the first.

## The protocol (operational)

```
worker context                                      observer context (fresh)
──────────────                                      ───────────────────────
do the Work
seal work
write retro-work.md        ──── hand over ────▶     receives the sealed Work
(finished; no further edit)                         (read-only) and one writable file
                                                    examines the completed Work from outside
                                                    writes retro-observe.md
seal Change  ◀──────────────── returns ───────────  nothing else changed
```

1. The orchestrator, not the worker, starts the observer, and starts it in a context that was never part of the Work: it has not seen the Work being done, and has no memory of the worker's reasoning. Whether the model is the same as the worker's is irrelevant.
2. The observer receives the sealed Work read-only and a place to write exactly one file. It does not receive write access to anything else.
3. After the observer returns, the Change is sealed. The Change seal is the single moment at which both retros become unalterable.
4. The worker does not edit anything once the observer has started.

None of this is provable from the artifacts; all of it is carried by instructions in Changing KAAL's Skill and retro reference, and by whoever orchestrates. The instructions also say plainly that it is operational, so a closed Change is not read as proof.

## What KAAL proves deterministically

Unchanged: Work sealed before the retros; both retros present before closure; Work and closed Change unalterable thereafter; the observer modifying the Work is detected. These are real guarantees, and the architecture does not describe them as more.

## Whether the observer sees `retro-work.md` (Q1)

The observer is the one at risk of anchoring: given the worker's lessons first, its own observation tends to answer them, and "does the Work reveal lessons the worker did not identify" can no longer be asked honestly. The worker is protected from anchoring by the existing order (`retro-work.md` is finished first). The symmetric protection for the observer is that it forms its view from the sealed Work alone, and `retro-work.md` is withheld from it until `retro-observe.md` is written. The two retros are then compared by their readers, side by side, after both exist. This changes the existing wording, which says the observer reads both, and is why it is raised as a question rather than assumed. Fallback if the existing wording is preferred: the observer reads both, and independence rests on the seat alone.

## Freezing the retros (Q2)

Between a writer finishing and the Change seal, neither retro is frozen deterministically. Two ways to meet R6:

- **A. Operational only (recommended).** The orchestration rule above, plus the Change seal. Cost: nothing. Limit: a retro can be edited in that window with no check noticing; the Change seal still freezes what was written at the end.
- **B. A deterministic seal of `retro-work.md`.** A seal using Sealing's existing unnamed-file identity, written when the worker finishes, so the stage "retro-work frozen" exists before the observer. It adds a new stage and a seal namespace, contradicts the present rule that neither retro has a seal of its own, and still would not prove independence or the order of events: a seal marker has no time. It would only make a later edit of `retro-work.md` detectable.

Recommended A: B buys detection of one edit, not independence, and a new namespace is not small. If B is wanted, it is a separate, later Change on the evaluator and Sealing.

## A defect found by the observer

`retro-observe.md` records it (Lacked, or Learned), and the Change is closed truthfully, with the defect named. The Work is sealed and is not reopened; no retro is rewritten. The fix is another Change, which may refer to the closed one by its identity. Whether the Change with the known defect is admitted before the fix Change is for the decision on admission, not for the observer. This composes with the rule that a Change is complete before admission: the Change is complete, and the finding is the evidence on which the admission decision is made.

## Where the lines fall

| property | class | where it lives |
|---|---|---|
| Work sealed first, both retros present, Change sealed | deterministic | the one process evaluator and Sealing, unchanged |
| the observer did not alter the Work | deterministic | Work seal |
| the observer did not alter `retro-work.md` | operational | read-only hand-over |
| `retro-work.md` finished before the observer starts | operational | the orchestrator starts the observer after it exists |
| the observer is another context that took no part in the Work | operational | Changing KAAL's Skill step and the orchestrator |
| the observer's first view is its own | operational | Q1: withhold `retro-work.md` |
| the observer is not the approver | by definition | Changing KAAL's retro reference |
| independence is not a vendor property | by definition | stated in the same reference |

## Smallest sharpening, for a later Change

Wording only, in Changing KAAL's Skill and retro reference: the observer is a separate context that took no part in the Work, the hand-over (sealed Work read-only, one writable file), the Q1 decision, the statement that this is operational, and the defect rule. The evaluator's message for the observer step is reworded to match. No Node, no Core change, no new seal, no new metadata, no change to the retro form, and no change to closure.
