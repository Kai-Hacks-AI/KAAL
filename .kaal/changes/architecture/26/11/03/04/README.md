# Architecture PLAN: functional placement of Defects

Owner: Architecture. Target: kaal/architecture. Ordinary working Change (documentation only);
record numbering is provisional until integration (proposed `architecture/C14`).

PLAN only. No Node, Skill, Definition, claim, package or policy changes. Nothing is synchronized,
promoted or published. Implementation is not authorized.

## 1. Intent

Kai (3 Nov): "Finding -> Proof by TC -> Defect. A Defect needs functional placement by Architecture,
very much like functional and non-functional requirements." This PLAN proposes how Architecture
records that placement.

## 2. The rule in one line

A Defect keeps the record of the context that raised it. Architecture adds one thing beside it: where
the failed responsibility sits (its functional placement), and whether the Defect is functional or
non-functional. Proof by Test Case comes first; placement comes after.

Worked example (Kai via the coordinator): Core builds Windows paths by hand instead of using Hosting.
The failed responsibility is Core's, because Core owns the choice to use the owner's answer
(`architecture/G3`). The Defect is placed against Core, not Hosting, because Hosting's own contract
holds. A Defect is placed against Hosting only when Hosting's own contract is broken.

## 3. Proposed record

- **Owning context is not placement.** The owning context is where the Defect record lives: the
  context that raised it (for example the Testing Defect Plan, #929). The functional placement is
  which capability's responsibility failed. They may differ: a Defect raised in one context can be
  placed against another capability's responsibility, and placing it never relocates, copies or
  re-owns the record. Architecture changes neither the raising context's ownership nor its Defect Plan.
- **No new relationship.** Reuse `Placement`, which Architecture already owns (outgoing, from a node to
  the capability that holds the responsibility, #891). Its source may be a Requirement Node or a
  Defect Node. Reverse views (all Defects placed against a capability) are derived, as for requirements.
- **A placement carries three things:** the capability (and Skill, when a Skill holds the
  responsibility), the class (`functional` or `non-functional`, the two classes requirements use),
  and grounds (one sentence, URBAN vocabulary where the failure is a missed Use, Adapt or New).
- **Which capability:** the one the violated Requirement is placed in, when a Requirement is violated.
  A consumer that duplicates an owner's answer is placed against the consumer (G3).
- **No single Requirement violated.** This includes non-functional Defects. Placement still follows
  the responsibility: Architecture places the Defect against the capability whose responsibility it
  is, from the failed behaviour and the architectural grounds. The Requirement is not a precondition.
  Where responsibility is shared or unclear, the placement says so in its grounds rather than being
  withheld. The finding may ask Requirements whether a Requirement is missing; that is optional input.
- **Placement is never a prerequisite.** A Defect is reported, proven by Test Case, confirmed, planned
  and escalated without any placement. An unplaced Defect is complete and valid, shown as "unplaced".
  Placement is added by Architecture on request, can change as learning changes the reading, and is
  never a gate on reporting, confirmation, FAR or PREACH escalation. Where a placement exists, those
  consumers may use it to address the placed capability.

## 4. Ownership

| Item | Owner |
| --- | --- |
| Finding, Test Case proof | Testing |
| Defect Node, Defect Plan and the record's owning context | the raising context (Defect incubated in Testing, kaal-defect) |
| Functional or non-functional vocabulary | Requirements |
| Placement of the Defect | Architecture |

Architecture does not create, close or judge Defects, and does not own the Defect Node.

## 5. How it lands

1. This PLAN (`architecture/C14`).
2. The Skill section and Node sentence join the held `Placement` work (`architecture/C9` to `C11`),
   because they share the same files and the Requirements dependency.
3. Testing and the Defect owner decide where the Defect Node carries the pointer. Architecture
   proposes only the record shape in section 3.

## 6. Cross-capability asks

- **Testing / Defect owner:** can a Defect Node reference a `Placement` target without owning it?
- **Requirements:** confirm the functional and non-functional vocabulary is reused as is.
- **Change / Engineering:** whether Defect Plans route by placement.

## 7. Open points (no recommendation forced)

- Whether an unplaced Defect should be visible in reports. Proposed: yes, as "unplaced".
- Whether one Defect may have two placements (provider and consumer). Proposed: no. One Defect, one
  placement; a second placement means a second Defect, linked by Test Case.

Auto-merge is enabled; approval and required checks govern.
