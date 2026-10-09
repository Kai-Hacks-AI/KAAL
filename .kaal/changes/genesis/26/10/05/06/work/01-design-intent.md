# Work selection: intent

Decide what KAAL needs in order to say what work happens next. This Change is design only: it states intent, requirements and architecture, and implements nothing.

## Observation

KAAL governs how work is performed: intent, requirements, architecture, work, retrospectives, seal. It says almost nothing about which work is performed. Today work emerges from conversation and becomes a Change at once. That is execution discipline without portfolio discipline, and it gets worse as more agents work at the same time: each can execute its own work correctly while the whole spends its effort on the wrong things, in the wrong order, twice.

## Intent

Make it possible to answer, from the KAAL directory alone and without relying on whichever conversation is active:

- what work exists,
- what is ready,
- what matters most,
- what is already being worked on,
- what an available agent may take next.

Find the smallest answer. Do not assume it is a backlog, a scheduler or a lifecycle.

## Stance

- Observation, prioritization and commitment are three different acts and stay three different acts. Noticing work is not ranking it, and ranking it is not committing to it.
- Strategic priority is human authority. Agents may find work, describe it, name its dependencies and recommend an order; they do not own the order.
- Priority is a judgment over a set of work, and it changes without the work changing. Identity stays stable; ordering stays mutable and is never part of identity.
- Prefer what KAAL already has: Changes, content identity, `{name, id}` references, supersession, derivation from artifacts. Add an artifact only where none of them can express a requirement, and no status that can be derived.
- Support several agents without a provider, a model or a central autonomous scheduler.
- Whatever hosts and transports a KAAL directory contributes no KAAL concept.
- Keep it small.

## Out of scope

- Implementing anything. Whatever realises this is a later Change.
- Estimates, deadlines, assignment to named workers, capacity planning.
- Any Change already in flight.
