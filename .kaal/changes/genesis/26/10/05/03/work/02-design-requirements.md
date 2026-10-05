# Two-agent retrospective independence: requirements

Vocabulary: the **worker** is the agent that performed the Change; the **observer** is the agent that writes `retro-observe.md`. A **seat** is the position, an **agent** is whoever occupies it.

## R1. Two seats, one occupant each, never the same

The worker and the observer are different agents. An agent that took part in the Work, in any context, does not write `retro-observe.md`. "Different" means an agent that did not participate in the Work and did not see the worker's reasoning: a separate execution context that was never part of it. It does not mean a different provider, vendor or model; the same model in a fresh context that has not seen the Work being done can observe, and a different vendor that took part in the Work cannot. The working assumption that one agent in two files is unacceptable is held.

## R2. The observer is not the approver

The observer's output is retrospective evidence only. It carries no verdict, gate or approval, and it is written to be true, not to be welcome.

## R3. The observer's inputs

The observer receives exactly: the sealed Work, and the means to write `retro-observe.md`. Whether it also receives `retro-work.md` before writing is a design question (Q1); the requirement is that the observer's first view is its own.

## R4. The observer cannot alter what it observes

The observer must not be able to change the Work, and should not be able to change `retro-work.md`. The Work is already protected by its seal. `retro-work.md` is the weak point (the audit: not frozen before closure) and R6 decides what to do.

## R5. The worker finishes before the observer starts, and cannot revise after

`retro-work.md` is complete before the observer begins, so it is not a response to the observer. After the observer has begun, neither the Work nor `retro-work.md` changes. Nothing may be altered to make the history tidier.

## R6. Freezing points

`work/` is frozen when sealed, before either retro. Each retro must be unalterable from the moment its writer finishes until the Change is sealed, and the Change seal covers both. Whether this needs a deterministic point of its own, or can be a rule of carrying out the Change, is Q2.

## R7. A defect found by observation

A defect or gap the observer finds is evidence and belongs in `retro-observe.md`. It does not reopen the Change: sealed Work is not revised, and no retro is rewritten. Work that the finding calls for is another Change. Whether the earlier Change should still be admitted is the decision of admission and review, not the observer's.

## R8. Deterministic and operational, kept apart

Every guarantee is classified as one or the other:

- **Deterministic**: a verdict computable from the Change's own artifacts and seals by existing machinery. It may only claim what bytes can show.
- **Operational**: a rule of how the Change is carried out, put in the instructions of the capability that owns the process, and obeyed by the agents and whoever orchestrates them.

No deterministic check may be described, or named, as proving independence unless it can. Independence of the observer is operational unless an identity attestation is added, and R9 says why one is not.

## R9. No identity or role machinery without need

The retro form forbids authorship and role labels, and rightly: a name inside a file is text the writer chose, so it would be an assertion, not evidence. A deterministic proof of "worker ≠ observer" would need an attestation of who acted, from outside the artifacts, which KAAL has no concept of. This Change adds no such concept, no authorship metadata, no new seal kind and no Core growth unless the architecture finds a requirement that cannot be met otherwise.

## R10. Existing facts preserved

The order work, seal work, `retro-work.md`, `retro-observe.md`, seal Change stays unless shown wrong. The retro form stays. Sealing is not weakened. No concept of whatever hosts the work appears in KAAL.

## R11. Honest limit

KAAL can prove that two retros exist beside a sealed Work and that the sealed whole has not been altered. It cannot prove that two different minds wrote them. What stands in for that proof is stated plainly in the instructions that govern the process, so that nobody reads a closed Change as having proved more.
