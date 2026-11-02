# Architecture PLAN: establish ownership and the traceability boundary

Owner: Architecture. Target: kaal/architecture. Ordinary working Change (documentation only);
record numbering is provisional until integration (proposed `architecture/C12`; C9 to C11 are
reserved by `architecture/C8` for SYNC, RED and the `Placement` DO).

PLAN only. No Node, Definition, claim, package, workflow or policy changes. No SYNC, promotion or
publication is requested or authorized by this PR.

## 1. Intent

The CPO handover of 2 Nov names Architecture as a capability with no owning thread, and #886 (C2)
finds that Intent, Requirements, Architecture, Code, Tests and Evidence are not one traceable chain.
This PLAN establishes who owns what at the Architecture end of that chain, so the other owners and
Engineering can coordinate against stated boundaries instead of conventions.

## 2. What exists (inspected on `origin/kaal/architecture` at 7b85d04, 10 ahead and 19 behind main; not run)

| Item | State |
| --- | --- |
| `kaal-architecture` 0.0.1 | Private, unscoped name, not on main, not on npm. Nodes `Architecture` (KAAL Capability) and `URBAN` (KAAL Definition), Agent Skill, Installation Contract, ownership claim, LOVE tests (#485) |
| `architecture/C8` PLAN (#588) | `Placement` Node so a decision can cite the Requirements it answers, optional composition with Requirements. Planned C9 to C11 not started |
| Named elsewhere | `engineering/RATS.md` and `GLUE.md` name `kaal-architecture` as the owner of functional placement. Core's registration tests use it as a fixture kind owner |
| Not Architecture's | Each capability's own `docs/architecture.md` and `plan/<topic>/architecture.md`: those are that capability's instances |

## 3. Ownership

- **A1 Architecture owns** the concept of an architectural decision and its grounds: Enterprise
  Architecture by URBAN, Solution Architecture as placement of required function, and the
  `Placement` relationship (outgoing, from a decision to the Requirement Nodes it answers).
- **A2 Architecture does not own** what must hold (Requirements), why (Intent), realization
  including Adapt and New (Engineering), judging evidence (Testing), generic Node assembly,
  registration and reverse views (Core and Graph), or the instances. The consuming capability owns
  its own architecture documents and any `Placement` Nodes it writes.
- **A3 Traces are outgoing only.** Architecture states `Placement` from its own elements and never
  declares incoming traces. Reverse views are derived (`engineering/research/owned-trees.md`, Option B).
- **A4 Coordination of the chain is not ownership of it.** Engineering coordinates cross-capability
  traceability and impact (C2, `engineering/C11`). Each hop is owned by the capability its source belongs to.

| Hop | Owner of the relationship | State |
| --- | --- | --- |
| Requirement serves Intent | Requirements (`Serves`, `requirements/C10`, #741) | PLAN on collector |
| Intent element as Node | Intent (`intent/C1`, `C2`, #740, #748) | DO on collector |
| Decision places Requirement | **Architecture** (`Placement`, `architecture/C8`) | PLAN on collector |
| Code to Architecture | Engineering and Change (not defined) | Open, section 5 |
| Test Case to Defect | Testing (`testing/C48`, #745) | PLAN open |
| Trace rule registration | Core (`core/C24`, `core/C30` #600) | Later Change per owner |

## 4. Proposed Changes (not authorized; order by dependency)

1. This PLAN (`architecture/C12`).
2. Hold `architecture/C9` SYNC. The SYNC policy needs the promotion to be next in line or development
   blocked. `Placement` DO is blocked only until `kaal/requirements` carries the Requirement Definition, and that is not on the critical path (Hosting, Foundation, Core).
3. When released by Kai: C9 SYNC, C10 RED, C11 DO `Placement`, then register its outgoing rule in Core in its own Change.
4. Scoped rename and any packaging follow Engineering's admission route for the Hosting migration. Nothing here pre-empts it.

## 5. Cross-capability needs (go to the owning thread)

- **Intent and Requirements:** no owning threads yet. Needed for the bracket-citation to Edge move and to confirm `Placement` targets `<cap>/F<n>` Requirement Nodes. Ask: arrange owners (CPO handover item 4).
- **Engineering:** owns the chain-level coordination. Ask: record which hop covers Code to Architecture. GLUE names `kaal-coding`, which does not exist (#851), so no owner exists for it today.
- **Testing:** confirm Architecture's boundary check (`architecture/F4`) stays Testing's judgment.
- **Core:** none until `Placement` exists.

## 6. Decisions for Kai

1. Confirm A1 to A4 as the Architecture boundary. Recommended: confirm.
2. Keep `Placement` (C9 to C11) held until Intent and Requirements have owners and the Hosting route is clear. Recommended: hold.
3. Package destiny: stay private. URBAN is general engineering knowledge and could justify an npm consideration later, under the npm rule, but not before `Placement` and a scoped name exist. Recommended: revisit then.

Auto-merge is enabled; approval and required checks govern.
