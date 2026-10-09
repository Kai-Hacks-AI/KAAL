# Requirements (draft, aligned to the Owner clarification on PR #71)

Fixed Intent: `01-intent.md`, unchanged. Owner clarification (comment on PR #71, kaihacksai): **the location of KAAL's engine must not determine the location of the Work it acts upon**, across Engineer, Embed and External KAAL; External KAAL must be able to operate on another repository, including authorized changes or PRs, **without requiring KAAL artifacts to be installed in that repository**; root-level `changes/` is a candidate implementation, not the Intent; no universal root layout is assumed and no sealed history is migrated before the boundary is demonstrated in all three modes; no migration or sealing is authorized.

## Words used

- **Engine**: an installed KAAL (Core, Nodes, Node seals, installed Skills and Extensions, instance `core/config`).
- **Subject**: the repository, change or PR KAAL's Work acts upon. It may be the engine's own repository, a host that embeds the engine, or a repository with no KAAL in it.
- **Record**: what KAAL keeps about Work it governed: Change directories and the seals that attest them (and, later, other repository-owned artifacts, see R10).
- **Operating modes**: *Engineer* (subject and engine in one repository, KAAL's own), *Embed* (engine installed inside the subject), *External* (engine and record apart from the subject, which holds no KAAL artifact).

## Requirements

- **R1 Independence.** Where the engine is installed implies nothing about where the Subject is or where the Record is kept. Neither is derived from the other by a fixed relative path.
- **R2 No universal layout.** KAAL's meaning (Nodes, Core, sealed text) states no directory layout for Records. A layout is a choice of an operating mode or an instance, stated outside sealed artifacts.
- **R3 External without installation.** In External mode nothing of KAAL is written into, or required to exist in, the Subject repository for KAAL to govern work on it, including work on its authorized changes or PRs. Authorization to act on the Subject stays the host's and is outside KAAL.
- **R4 The Record travels with its own seals.** The seals that make a Change closed are kept where the Change is kept, so that the Record alone can be checked for closure wherever it is held. Node seals stay with the engine.
- **R5 One process, any location.** The Change process (allocate, work, review, seal work, retros, seal Change, state) behaves identically wherever the Record is held. No step reads the location of the engine to decide where the Record is.
- **R6 Identity is address-free.** A Change's identity does not depend on its address or on where its Record is held (as sealed today). Moving a whole Change anywhere keeps it closed; nothing inside it changes.
- **R7 Sealed history is not rewritten.** Existing Change IDs, seals, tree seals and sealed text keep their bytes. No admitted artifact is edited, re-sealed, removed or replaced. Moving existing Records is not presumed; it is a decision of its own, taken only after R8 holds.
- **R8 Demonstrated before migrated.** The boundary is shown to hold in Engineer, Embed and External with the machinery as it is (or with the smallest bridge) before any existing Record is moved.
- **R9 Controls follow the Record, not a path.** Repository controls (isolation, admission, preservation of closed Changes and seals) are told which Records they judge; a path inside the engine directory is not their definition of "the Record". They keep judging by identity.
- **R9a Baseline and candidate are resolved separately.** The baseline Record is assembled from the target revision using locations that revision declares; the candidate Record from the candidate checkout using the locations it declares. A candidate cannot choose, narrow or empty the baseline by changing its own locator, and a Record moved whole between locations is preserved while one that omits a closed Change is refused (demonstrated in `04-architecture.md`). A Change or seal at the same address in two locations of one revision is ambiguous and refused.
- **R10 One principle, later extent.** The same separation applies to Requests, Incidents, Collections and other repository-owned artifacts, but this Change settles it for Changes only and introduces nothing that would force those to be different.
- **R11 Core and sealed Nodes unchanged.** No Core, Node or `.github/` change is needed by the principle; any that would be needed is named as a separate, isolated Change.
- **R12 No compatibility debt left behind.** Any bridge that lets old and new locations both work is temporary by construction and has a stated removal step.
- **R13 Separate from PR #70.** Nothing here implements Collection or its root-level `clients/`, `requests/`, `incidents/`; shared needs (R9) are named, not combined.

## Out of scope

Choosing a directory name; moving or sealing any existing Change; authorization of work on a Subject; how an External KAAL reaches a Subject; the Reviewer's judgment (the Owner supplies the independent Reviewer).
