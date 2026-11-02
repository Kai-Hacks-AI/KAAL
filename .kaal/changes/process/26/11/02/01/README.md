# kaal-process as the framework processes are designed on (PLAN)

Capability: Process. Target: kaal/process at `2a14668`. Record number is
provisional until integration.

Kai's idea: `kaal-process` is the underlying concept for managing processes.
A given process (PDCA, DevOps, a release route) is designed on it and uses KAAL
capabilities as Lego-like bricks, so the structure stays flexible.

This PLAN maps what Process is today against that idea, proposes the concept,
and shows DevOps as an instance. Markdown only. No Node, Definition, claim,
package, workflow or policy is created or changed. Any amendment to the Process
Definition would be its own later Change, on Kai's decision.

## 1. What Process is today

Package `packages/skills/kaal-process` (#275 PC-1, #526 PDCA; promotion #560,
sync #559 already merged into kaal/process).

| Piece | What it says |
|---|---|
| Capability Node `Process` | Owns the metamodel's concepts and their meaning, and nothing a consumer describes with them. Needs only Core's KAAL Capability and KAAL Definition. |
| Definition `Process` | A repeatable way of working, **defined and owned by the capability whose purpose it serves**. Concepts: Activity, Role, State and Transition, Ordering (sequence, parallel, concerns, loop), Entry and Exit conditions. |
| Definition `PDCA` | The first instance: Plan, Do, Check, Act as a recursive loop. |
| Rules | Process keeps no registry. Describing a process authorizes nothing and makes nothing mandatory. A Role is not an Agent. A State is derived from facts. |

Against Kai's idea: the foundation is already right. Process is the framework,
PDCA is an instance, and applicability is decided where a process runs. Three
things are missing for the Lego structure.

1. **No way for an Activity to say who serves it.** Activities exist, but the
   metamodel has no concept linking an Activity to the capability that does the
   work. #851 had to invent "serves" in prose.
2. **Single-owner assumption.** "Owned by the capability whose purpose it
   serves" fits PDCA and a Change's lifecycle. It does not fit a process that
   spans capabilities, such as DevOps, which no single capability's purpose is.
3. **No composition between processes.** PDCA recurses by hand-written prose
   ("Do may contain inner cycles"); the metamodel has no general statement that
   an Activity may itself be a Process.

## 2. The concept

Three layers, with the dependency pointing one way only (a brick never knows
the model it sits in):

```
Process (kaal-process)        the metamodel: Process, Activity, Role, State,
                              Transition, Ordering, Entry/Exit. Owns meaning only.
        ^ uses
Process design (an instance)  a described process built on the metamodel, owned by
                              whoever is accountable for it (a capability, or
                              Engineering for delivery processes). PDCA, DevOps.
        ^ refers to
Capabilities (the bricks)     existing Capability Nodes. They declare nothing
                              about any process; they are referred to, not changed.
```

### How a process is defined

A process design is a KAAL Definition (typed by Core's KAAL Definition, as PDCA
already is) kept by its accountable owner. It states, using only Process's
concepts: purpose and applicability, Activities, Ordering, Roles, observable
States and allowed Transitions, Entry and Exit conditions. This needs no change
to Core and creates no new Node type.

### How it composes capabilities

One new relation is proposed, **Serving**: an Activity of a process design names
the capabilities that serve it, by their Capability Nodes.

- Many-to-many: a capability may serve several Activities, an Activity several
  capabilities.
- One direction: the design points at capabilities. A capability's documents
  need not mention any process. Optionally it may say which Activities it is
  suited to; that is documentation, never a requirement.
- Replaceable: swapping the capability that serves an Activity changes the
  design only, never the capability. That is the Lego property.
- A finding, not a defect: an Activity with no serving capability is shown as a
  finding that needs interpretation. It may be manual, operated externally, or
  intentionally unallocated. Nothing is mandatory, so a gap blocks nothing.
- Nesting: an Activity may itself be a process design (PDCA inside a DevOps
  stage). An inner process contributes facts to the enclosing Exit condition and
  never substitutes for it, the rule PDCA already states for Check.

Unchanged on purpose: Process keeps no registry (a design lives with its owner,
and a registry would make Process a dependency of every consumer); a design
authorizes and mandates nothing; a Role is fulfilled by an actor and is not an
Agent; States stay derived from facts.

### Serving is accountability, not realization

Serving says which Capability is accountable for, or provides, an Activity's
responsibility. It is not a claim about who or what performs the Activity, and
Capabilities are not the only CASE elements relevant to executing a process. An
Activity may be performed by an Agent, guided by a Skill, realized through an
Extension, or done by hand. A design may describe such realizations in its own
words, next to the Serving it names. This PLAN adds no second formal relation
for realization and does not redesign the metamodel: the room is left open, and
whether a realization relation is ever warranted is decided later, on evidence
from real designs. Serving stays one-way (design to Capability) and ownership
stays independent.

### Where designs live

With the accountable owner, like PDCA lives with Process. PDCA stays in Process
because it is generic. DevOps, a delivery route, belongs to Engineering. A
capability's own lifecycle (a Change's PLAN, DO, CHECK) stays with that
capability, and may be described on the metamodel without moving.

## 3. DevOps as an instance

#851 (Engineering PLAN, DevOps thread) already frames DevOps this way. Mapped
onto the concept:

| Process concept | DevOps |
|---|---|
| Process design | DevOps delivery loop, owned by Engineering |
| Activities | Plan, Code, Build, Test, Release, Deploy, Operate, Monitor |
| Ordering | Sequence of the eight, closed as a loop back to Plan until the Exit condition holds |
| Roles | Owner, Worker, CI (the actors are humans, CASE Agents, workflows) |
| States | Derived from PR state, checks, registry state, never stored |
| Transitions | SYNC, promotion, publish, each with the explicit authorization already required |
| Serving | Plan: Change, Intent, Requirements, Architecture, Product. Code: Engineer Skill, Hosting, Foundation, Core. Build: Packaging, Engineering, Foundation. Test: Testing, Guard, Graph, Engineering. Release: Engineering, Packaging, Change. Deploy: Core, Hosting. Operate: none. Monitor: Review, Learning, Controls, Graph, Guard. |
| Nesting | Each Change inside Plan..Deploy is a PDCA instance; Monitor feeds the next Plan through PDCA's Act |

Operate having no serving capability is the first finding the design shows. It
needs interpretation: Operate may be external to KAAL, manual, or intentionally
unallocated. The design makes it visible without creating a capability to fill
it, and DevOps Activities may equally be performed by Agents, guided by Skills
or realized through Extensions alongside the Capabilities that serve them. Whether Operate gets an owner remains Kai's decision (#851).

### Check of #851 against Process's concepts

Correct: eight Activities, loop Ordering, States from facts, Transitions owned
by the process's owner, design kept by Engineering, no registry, nothing
mandatory.

To adjust (told to the DevOps thread): **Agent must not be listed as a Role.**
Owner and Worker are Roles; a CASE Agent is an actor that may fulfil Worker. CI
is an authorized participant and may fulfil a Role. The "Serving" column in
#851 section 3 is the proposed relation; it can keep using prose until Kai
decides on section 4.

## 4. Decisions for Kai

1. **Adopt Serving as a Process concept?** Recommended yes, as a small
   amendment to the Process Definition: a Change on kaal/process, then through
   #560. Alternative: keep Process unchanged and let each design describe
   serving in prose (works today, not checkable).
2. **Loosen "owned by the capability whose purpose it serves"** to "owned by
   whoever is accountable for it". Recommended yes, for cross-capability
   designs such as DevOps. Needed together with 1.
3. **Nesting as a general statement** (an Activity may be a process design).
   Recommended yes; it generalizes PDCA's recursion without new machinery.
4. **Timing.** #560 is open and carries the unamended metamodel. Recommended:
   let #560 land as is, then amend, so Owner-approved #275 and #526 stay
   untouched. DevOps (#851) can proceed in the meantime, in prose.

Not proposed: a Node type for processes, a registry, enforcement or checking of
designs, any change to Core, or a package for process designs. A checker for
Serving (which Activities lack a serving capability) is possible later and would
belong to Graph or Testing, not Process.

## Scope and authorization

This record only. Ordinary PLAN Change: independent review and required checks
precede integration. No synchronization, promotion or publication is authorized.
