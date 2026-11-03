# Process: metamodel, PDCA as first template, instances with their owners, explicit ACT (PLAN)

Capability: Process. Target: kaal/process at `0033510`. Record number is
provisional until integration. Markdown only: no Node, Definition, claim,
package, workflow or policy changes.

Owner direction (3 Nov): the core concept is PLAN -> DO/CHECK -> ACT. In
practice PLAN PRs drive, DO PRs go red to green, and ACT is implicit, mostly
feeding new PLAN PRs. kaal-process holds the core concepts of process
management. PDCA, DevOps and possibly others are instances of it. Whether
kaal-process owns the instances is open: "maybe as start".

## 1. Who owns what

| Piece | Owner | Why |
|---|---|---|
| The metamodel (Process, Activity, Role, State, Transition, Ordering, Entry/Exit) | Process | Process's whole scope (#275). |
| **PDCA** as a generic, recursive template | **Process, as the first instance** | It is generic and no other capability's semantics (#526, #620 "Process Template"). This is the "as start": it incubates in Process, in the package that already holds it. No new package. |
| A capability's own lifecycle (a Change's PLAN, DO, CHECK) | That capability (Change) | Already stated in the Process Node. |
| **DevOps** | **Engineering**, as a process design on the metamodel | Approved in #852 and drafted in #851: DevOps is not a capability and has no package. It is the delivery route Engineering owns. |
| Other instances (for example the CTO/CPO exchange) | Their accountable owner | #852: owned by whoever is accountable. |

Process incubates only what is generic enough to be reused by several owners,
and moves an instance to its owner when that owner exists to take it, the way
Defect incubates in Testing. Today only PDCA qualifies. Process keeps no
registry of instances and dictates no instance's semantics.

Where this differs from a first reading ("DevOps stays its own capability"):
DevOps is an instance, as the Owner said, and by #851/#852 it is described by
Engineering and is not a Capability. No change to #852 is proposed.

## 2. Making ACT explicit, and light

Today PDCA.md already defines Act: preserve the knowledge, then respond to what
Check found (adopt, adjust, or begin a new Plan), changing nothing by itself.
What is missing is practice: a finished Change records no ACT, so Act happens
only when a finding happens to feed a later PLAN.

Proposal, in two parts so ownership stays clean:

1. **Vocabulary, owned by Process (a later small Change to PDCA.md).** Name the
   three responses Act can take: **Standardize** (the result becomes the way
   from now on, with its owner's authorization), **Adapt** (change the approach
   and start a new Plan, linked), **Drop** (stop, with the reason kept). These
   restate "adopt, adjust, or begin a new Plan" and add Drop. Act still changes
   nothing by itself; each response needs its owner's authorization.
2. **Practice, owned by Change (a request, not a Process rule).** Each finished
   Change closes with a short ACT note in its record: Standardize, Adapt (with
   links to follow-up PLANs) or Drop, and "nothing" when nothing follows. This
   is Change's lifecycle, so Process does not mandate it. This PLAN asks the
   Change capability to consider it, and Learning for where retrievable
   knowledge goes (retrospectives are Learning's).

The note stays one short paragraph. Where a Change has no lesson, "no action" is
a valid ACT, and a failure is not manufactured to fill it (PDCA already says so).

## 3. What this record changes

Nothing is implemented. The metamodel promoted by #560 stays the unamended text.
The vocabulary change (part 1) and the Serving amendment of #852 are separate
later Changes, after #560 lands. The Change request (part 2) is raised with the
Change capability by pull request, not enforced from here.

## Open questions

1. Is "Drop" wanted as a named response, or is "no action" enough?
2. Should the ACT note live in the Change record, or on the realizing PR?
   (Learning's open decision D1 from #526.)
3. Which instance, after PDCA, is the next candidate to incubate in Process
   rather than go straight to its owner?

## Scope and authorization

This record only. No SYNC, promotion or publication.
