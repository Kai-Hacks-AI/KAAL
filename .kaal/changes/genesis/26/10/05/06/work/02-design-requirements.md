# Work selection: requirements

Vocabulary: **work** is something that might be done; a **Change** is governed work already begun. "In KAAL" means decidable from the KAAL directory.

## R1. Work that is not yet a Change has a stable identity

Work that might happen but is not yet a Change can be referred to by `{name, id}`, and the reference never changes meaning. Identity is the exact bytes of what the work says, like every other KAAL identity; changed bytes are other work, and the old work keeps its meaning.

## R2. Existing is not ordered, and ordered is not begun

Four facts about work stay independent: it exists; a human has ranked it; an agent has taken it; it is done. No one of them implies another. In particular, existing does not rank it, and ranking it does not begin a Change.

## R3. Order is a human judgment and is mutable

The order of work is changeable at any time without changing the identity of anything it orders. It is not sealed and not part of any work's identity. It is a single answer, not one per conversation.

## R4. Agents contribute without owning

Anyone, an agent included, may bring work into existence, state what it depends on, and recommend an order. Only a human decides the order. KAAL cannot see who wrote a file, so this authority is kept by the instance's own rules for who may change the order, not claimed by KAAL.

## R5. Commitment is the beginning of a Change

Work becomes a Change when an agent takes it, and not before. A Change records which work it took.

## R6. Dependencies are references to other work

A piece of work may say it comes after other work, by reference. A dependency can only refer to work that already exists, so dependencies cannot form a cycle. Whether the dependency is satisfied is read from the dependency's own state, never declared.

## R7. Ready, blocked, in flight and done are derived

No status is stored. From existence, order, dependencies and Changes, a deterministic reading says for each piece of work whether it is ranked, blocked, ready, taken, or done. A reading that disagrees with a stored value is a defect of the stored value, so none exists.

## R8. An agent can be told what to take

For an available agent, KAAL can answer what it may take next: the highest-ranked work that is ready and not already taken. The answer needs no conversation, no central scheduler and no knowledge of other agents beyond the KAAL directory.

## R9. Duplicate pickup is a detectable contradiction

Two open Changes that took the same work are a contradiction a deterministic reading finds. Whether it can be prevented rather than detected depends on how many views of the KAAL directory exist; KAAL states that limit instead of hiding it.

## R10. Parallel is the default; sequence is stated

Ready work may proceed in parallel. Sequence is introduced only by an explicit dependency, which is how overlap on the same boundary is handled: a human or an agent states which work comes after which.

## R11. Urgency is reordering

Work overtakes other work only by being ranked above it. Reordering changes what the next available agent may take; it does not interrupt a Change in flight, and stopping one is a separate, human act.

## R12. History is not falsified

Abandoned or superseded work leaves no trace of having been something else. Changed work is other work (R1); dropping work from the order deletes nothing; a Change that stops is closed with its retrospectives saying so, never edited or removed.

## R13. Retrospectives feed discovery, not the order

What a retrospective observes may lead someone to bring new work into existence. It never ranks it and never begins it automatically.

## R14. Without a host

The model works with only a KAAL directory visible to every participant. A host may transport that directory and enforce who changes the order; it contributes no concept.

## R15. Honest limits

KAAL can derive what is ready and what is taken. It cannot judge value, urgency, or whether a piece of work is worth doing; that stays human. It cannot prove who ranked something, and with several unsynchronised views of the directory it can detect, not prevent, two agents taking the same work.
