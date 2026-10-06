# Two-agent retrospective independence: architecture

Independence of the observer is established by how the Change is carried out, using existing concepts, and stated honestly as such. The process guides the sequence actively, through a defined handoff. KAAL's deterministic checks stay as they are, beyond one open point.

## Roles are Agent instructions, not identities

An Agent in KAAL is a Bare agent steered through instructions, and a Skill specifies desired behaviour for a kind of work. The worker and the observer are therefore not two new kinds of thing. They are the same kind of Agent, steered by two different steps of the Changing KAAL Skill, in two contexts. Nothing identifies the actors, because nothing needs to: the instructions create the seat, the handoff creates the separation, and the second seat is occupied by an agent selected outside the first.

## The handoff is a state KAAL already derives

The evaluator's stage "retro-work present" is exactly the handoff state: Work sealed, `retro-work.md` present, no `retro-observe.md`. No new stage, seal or metadata is needed to name it. What is missing is not the state but the instruction to stop in it and the instruction for whoever takes the Change from it.

```
worker                          handoff                       observer (selected outside the worker)
──────                          ───────                       ────────
do the Work
seal Work
write retro-work.md  ──▶  state: Work sealed,  ──▶  told its role, input, output
STOP                      exactly retro-work        reads sealed Work + retro-work.md
                                                    writes retro-observe.md, nothing else
                                  incorporate the text, unchanged in substance
                                          seal Change (closed) ──▶ admission
```

## The protocol (operational)

1. **Worker.** Does the Work, seals it, writes `retro-work.md`, and stops. It does not write, spawn, brief or select the writer of `retro-observe.md`, and it does not seal the Change. The Skill's worker steps end at `retro-work.md` with an explicit stop, not with the closing steps.
2. **Handoff.** The Change is now in one exact state and leaves the worker's execution. Whoever receives it, a person or an orchestration other than the worker, selects the observer.
3. **Observer.** A separate execution context that took no part in the Work. It is told by the process that it is the observer, not the approver; that its input is the sealed Work and `retro-work.md`; that its output is exactly `retro-observe.md` in the retro form; and that it changes nothing else. It reads, then writes from its own seat, without restating or answering the worker.
4. **Incorporation.** The observer's text is placed in the Change unchanged in substance. Placing and formatting are not editing; adding, softening, answering or removing are.
5. **Closure.** Only then is the Change sealed. The Change seal is the single moment at which both retros become unalterable.
6. **Defect found.** Recorded in `retro-observe.md`; it does not reopen the Change (below).

The Skill gives two instructions where today it gives one ordering: to the worker, "stop at the handoff", and to the observer, its role, input and output. The observer's instruction lives where the observer will find it: in the handoff, so that an agent that is only handed a Change, and has not seen the worker's Skill steps, still knows what it is.

## The counterexample

A worker that, before any handoff, spawns its own fresh sub-agent to write `retro-observe.md`, and closes the Change itself, passes every deterministic check and leaves the Change with a clean-context observer. It still fails: the observer was selected, briefed and bounded by the worker; nothing ever crossed a boundary; and the observation lives inside the worker's execution. The protocol rules it out by construction, because the worker stops at the handoff and the selection of the observer is not the worker's act. The Skill names this case as what not to do.

What this leaves unproven is worth saying: from a closed Change alone, KAAL cannot tell a properly handed-off Change from this one. That is the operational limit (R11), and what makes the difference visible is the process around the Change, not its bytes.

## What KAAL proves deterministically

Unchanged: Work sealed before the retros; both retros present before closure; Work and closed Change unalterable thereafter; the observer modifying the Work is detected. These are real guarantees, and the architecture does not describe them as more.

## Whether the observer sees `retro-work.md`

Yes. The observer reads the sealed Work and `retro-work.md`, as the Skill and the retro reference already say. The risk this carries is anchoring: the observer echoing the worker. It is met by the seat and by the instruction that the observer does not restate or answer the worker, not by withholding the worker's retro. This is a decision, not an open question.

## Freezing the retros (Q1)

Between a writer finishing and the Change seal, neither retro is frozen deterministically. The handoff makes the window short and explicit, but does not close it. Two ways to meet R6:

- **A. Operational only (recommended).** The protocol above, plus the Change seal. Cost: nothing. Limit: a retro can be edited in that window with no check noticing; the Change seal still freezes what was written at the end.
- **B. A deterministic seal of `retro-work.md`.** A seal using Sealing's existing unnamed-file identity, written when the worker finishes, so that "retro-work frozen" is an evaluator stage before the observer. It adds a stage and a seal namespace, contradicts the present rule that neither retro has a seal of its own, and still would not prove independence or the order of events: a seal marker has no time. It would only make a later edit of `retro-work.md` detectable, and give the handoff a deterministic edge.

Recommended A: B buys detection of one edit, not independence. If B is wanted, it is a separate, later Change on the evaluator and Sealing.

## A defect found by the observer

`retro-observe.md` records it (Lacked, or Learned), and the Change is closed truthfully, with the defect named. The Work is sealed and is not reopened; no retro is rewritten. The fix is another Change, which may refer to the closed one by its identity. Whether the Change with the known defect is admitted before the fix Change is for the decision on admission, not for the observer. This composes with the rule that a Change is complete before admission: the Change is complete, closed after the observer's contribution, and the finding is the evidence on which the admission decision is made. A Change that reaches admission is therefore always one that has already passed its handoff.

## Where the lines fall

| property | class | where it lives |
|---|---|---|
| Work sealed first, both retros present, Change sealed | deterministic | the one process evaluator and Sealing, unchanged |
| the handoff state is Work sealed plus exactly `retro-work.md` | deterministic | the evaluator's existing stage; named, not added |
| the observer did not alter the Work | deterministic | Work seal |
| the worker stops at the handoff | operational | Changing KAAL's Skill, worker steps |
| the observer is selected outside the worker's execution context | operational | the handoff, Changing KAAL's Skill |
| the observer did not alter `retro-work.md` | operational | the observer's stated output: exactly one file |
| the observer is another context that took no part in the Work | operational | Changing KAAL's Skill and whoever receives the handoff |
| the observer knows its role, input and output | operational | the instruction given at the handoff |
| the observer's text is incorporated unchanged in substance | operational | Changing KAAL's Skill, closing step |
| the observer is not the approver | by definition | Changing KAAL's retro reference |
| independence is not a vendor property | by definition | stated in the same reference |

## Smallest sharpening, for a later Change

Wording only, in Changing KAAL's Skill and retro reference: the worker's steps end at `retro-work.md` with a stop at the handoff; the observer's instruction (role, input, output); that the observer is selected outside the worker's execution context; incorporation unchanged in substance before sealing; the defect rule; the statement that this is operational; and the worker-spawned observer as the named counterexample. The evaluator's message for the observer step is reworded to match, and its stage for the handoff state is described as the handoff. No Node, no Core change, no new seal, no new metadata, no change to the retro form, and no change to closure.
