---
name: Change Record
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# Change Record

A Change Record holds what supports one Change in a repository: its coordination, rationale, decisions, references and evidence. It references the work and never contains it. Requirements, architecture, code, tests and deliverables stay where the capabilities that own them keep them, so a record is never a second source of truth.

A Change Record is not the Change. Change owns its Change objects: each Change has its own canonical identity and relationships, and KAAL registers and navigates it independently of where its record lies and of the technology that realizes it. A record folder is not the Change and not its canonical content store. It is an address for the Change's evidence and transition history, and it links to the authoritative objects, the Change among them, without duplicating them. Git and GitHub realizations, such as pull requests and merge checks, are optional controls a repository may apply.

A record documents the transition: why the Change was made, how, and with what evidence. The authoritative documentation of the state that results stays with its owners. The two are distinct concerns, linked from the record and never duplicated in it.

A record is the folder `<root>/<capability>/YY/MM/DD/CC/`. The root is chosen by the consuming context, not by Change: no placement is universal. KAAL's own repository keeps its records under `.kaal/changes/`, a local convention: `kaal-change` names the capability, and `changes/` holds its instances. `<capability>` is the name of the capability the Change belongs to, in lowercase letters, digits and single hyphens. `YY/MM/DD` is the day the record was opened. `CC` numbers that capability's records of that day, from `01` to `99`.

Every pull request into a collector is a Change. A substantive Change, one that brings new work into its collector, claims at most one record folder, the one it changes, and a record's files lie inside that folder. Whether every substantive Change must claim one is the embedding repository's choice; KAAL's own repository requires it, so there a substantive Change claims exactly one. A synchronization is a Change that carries work already accepted elsewhere, together with the records it was accepted with; it claims no new number and changes no record of its own. The number is provisional until the Change is accepted into its collector: an agent takes the next free number for the day, works with its record in the pull request, and the claim is checked when it merges. A pull request closed without merging consumes no number. If the number is not the next free one when it merges, because another accepted Change already holds it or because it skips ahead, the check fails and the Change renames its folder to the next free number, updates its references and is checked again. A record the collector holds belongs to the Change accepted with it, so no later Change changes it, whether or not that Change was rebased onto the collector. There is no allocator, lock or registry. Change defines the numbering and what a collision is. The check runs at merge, fresh against the collector's tip, as Engineering's Branching gate, one merge at a time.

The path is an address for finding a record. It is not the identity of a Node: a record's contents keep their own identity, and Core does not admit anything as a Node because it lies under this path. Change defines the path's syntax and numbering; reading and writing files there is Hosting's.
