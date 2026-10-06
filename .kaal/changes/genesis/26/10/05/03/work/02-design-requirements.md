# Two-agent retrospective independence: requirements

Vocabulary: the **worker** is the agent that performed the Change; the **observer** is the agent that writes `retro-observe.md`. A **seat** is the position, an **agent** is whoever occupies it.

## R1. Two seats, one occupant each, never the same

The worker and the observer are different agents. An agent that took part in the Work, in any context, does not write `retro-observe.md`. "Different" means an agent that did not participate in the Work and did not see the worker's reasoning: a separate execution context that was never part of it, and never part of the worker's execution (R12). A fresh context that comes out of the worker's own execution is not enough. It does not mean a different provider, vendor or model; the same model in a fresh context that has not seen the Work being done can observe, and a different vendor that took part in the Work cannot. The working assumption that one agent in two files is unacceptable is held.

## R2. The observer is not the approver

The observer's output is retrospective evidence only. It carries no verdict, gate or approval, and it is written to be true, not to be welcome.

## R3. The observer's inputs

The observer receives exactly: the sealed Work, `retro-work.md`, and the means to write `retro-observe.md`, together with a statement of its role, input and output (R13). It reads the worker's retro, and writes from its own seat: it does not restate or answer it, and it does not speak for the worker.

## R4. The observer cannot alter what it observes

The observer must not be able to change the Work, and should not be able to change `retro-work.md`. The Work is already protected by its seal. `retro-work.md` is the weak point (the audit: not frozen before closure) and R6 decides what to do.

## R5. The worker finishes before the observer starts, and cannot revise after

`retro-work.md` is complete before the observer begins, so it is not a response to the observer, and the Change then waits at the handoff (R12). After the observer has begun, neither the Work nor `retro-work.md` changes. Nothing may be altered to make the history tidier.

## R6. Freezing points

`work/` is frozen when sealed, before either retro. Each retro must be unalterable from the moment its writer finishes until the Change is sealed, and the Change seal covers both. Whether this needs a deterministic point of its own, or can be a rule of carrying out the Change, is Q1.

## R7. A defect found by observation

A defect or gap the observer finds is evidence and belongs in `retro-observe.md`. It does not reopen the Change: sealed Work is not revised, and no retro is rewritten. Work that the finding calls for is another Change. Whether the earlier Change should still be admitted is the decision of admission and review, not the observer's.

## R8. Deterministic and operational, kept apart

Every guarantee is classified as one or the other:

- **Deterministic**: a verdict computable from the Change's own artifacts and seals by existing machinery. It may only claim what bytes can show.
- **Operational**: a rule of how the Change is carried out, put in the instructions of the capability that owns the process, and obeyed by the agents who carry it out.

No deterministic check may be described, or named, as proving independence unless it can. Independence of the observer is operational unless an identity attestation is added, and R9 says why one is not.

## R9. No identity or role machinery without need

The retro form forbids authorship and role labels, and rightly: a name inside a file is text the writer chose, so it would be an assertion, not evidence. A deterministic proof of "worker ≠ observer" would need an attestation of who acted, from outside the artifacts, which KAAL has no concept of. This Change adds no such concept, no authorship metadata, no new seal kind and no Core growth unless the architecture finds a requirement that cannot be met otherwise.

## R10. Existing facts preserved

The order work, seal work, `retro-work.md`, `retro-observe.md`, seal Change stays unless shown wrong. The retro form stays. Sealing is not weakened. No concept of whatever hosts the work appears in KAAL.

## R11. Honest limit

KAAL can prove that two retros exist beside a sealed Work and that the sealed whole has not been altered. It cannot prove that two different minds wrote them. What stands in for that proof is stated plainly in the instructions that govern the process, so that nobody reads a closed Change as having proved more.

## R12. The handoff

The worker stops at a defined state, the handoff: Work sealed, and exactly `retro-work.md` present, with no `retro-observe.md`. The worker does not write the observer's retro, does not produce it through anything of its own execution, and does not seal the Change. The next actor to occupy the observer seat must be independent: it must not have participated in the Work or in the worker's execution. How an actor comes to occupy that seat is outside KAAL, which establishes only the state and the requirement. The process must tell the worker to stop at that state, not leave it to inference.

## R13. The observer is told its role

At the handoff the observer is told, by the process and not by the worker's own choice of words: that it is the observer and not the worker, not the approver and not a reviewer of the code; that its input is the sealed Work and `retro-work.md`; that its output is exactly `retro-observe.md`, in the retro form; and that it changes nothing else.

## R14. Incorporation, then closure

The observer's text is incorporated into the Change unchanged in substance. Placing it, fixing formatting or fitting the retro form is not editing it; adding to it, softening it, answering it or removing from it is. Only after it is incorporated is the Change sealed. The worker may place the text and seal, but neither gives the worker authorship of it.

## R15. A worker-spawned observer is insufficient

A Change whose `retro-observe.md` was produced by a sub-agent that came out of the worker's own execution, before any handoff, does not meet R1 or R12, however clean that sub-agent's context. The process says so explicitly and gives this as the example of what not to do.
