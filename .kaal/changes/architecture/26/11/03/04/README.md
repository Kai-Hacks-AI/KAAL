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

A Defect is placed in the capability that owns the responsibility that failed, and classified as
functional or non-functional. Proof by Test Case comes first; placement comes after.

Worked example (Kai via the coordinator): Core builds Windows paths by hand instead of using Hosting.
The failed responsibility is Core's, because Core owns the choice to use the owner's answer
(`architecture/G3`). The Defect is placed in Core. It is not a Hosting Defect, because Hosting's own
contract holds. A Hosting Defect exists only when Hosting's own contract is broken.

## 3. Proposed record

- **No new relationship.** Reuse `Placement`, which Architecture already owns (outgoing, from a node to
  the capability that holds the responsibility, #891). Its source may be a Requirement Node or a
  Defect Node. Reverse views (all Defects of a capability) are derived, as for requirements.
- **A placement carries three things:** the owning capability (and the Skill, when a Skill is the
  owner), the class (`functional` or `non-functional`, the same two classes requirements use), and
  grounds (one sentence, URBAN vocabulary where the failure is a missed Use, Adapt or New).
- **Which capability owns it:** the one the violated Requirement is placed in. If no Requirement is
  violated, Architecture places the Defect from the failed behaviour and the finding asks Requirements
  whether a Requirement is missing. A consumer that duplicates an owner's answer is the consumer's
  Defect (G3).
- **Order and states:** a Defect without placement is valid and shown as unplaced. Placement is added
  by Architecture on request, never required to open a Defect and never a gate. Placement can change
  as learning changes the reading; the Defect is the same Defect.
- **What it enables:** PREACH escalation, Defect Plans and FAR can address the owning capability by
  its placement instead of by guesswork (CODEX rule, #929).

## 4. Ownership

| Item | Owner |
| --- | --- |
| Finding, Test Case proof | Testing |
| Defect Node and Defect Plan | the Defect owner (kaal-defect, incubated in Testing) |
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
  owner; a second owner means a second Defect, linked by Test Case.

Auto-merge is enabled; approval and required checks govern.
