# Requirements (draft, for Owner alignment)

Against the fixed Intent (`01-intent.md`) and the Owner's direction on PR #70: the intended KAAL repository tree has three distinct root-level entities, `clients/`, `requests/` and `incidents/`, related through explicit mappings; Collection is how KAAL obtains evidence, not necessarily the canonical persistent object.

## Four things kept apart

| Thing | Question it answers | Today |
|---|---|---|
| Client identity | Who is it? | Collector's name only |
| Collection observation | When and by what means did KAAL see something? | `collections/YY/MM/DD/CC/<name>/reach.md`: outcome, adapter, declared date |
| Carrier byte identity | Which bytes? | SHA-256, kept with client-relative path |
| Communication identity | Which thing did a client address to KAAL? | Not represented |

## Requirements

- **R1** Client, communication, carrier and collection observation each have their own identity, and none is derived from another's address, path or name.
- **R2** A client is never identified by transport, adapter, provider, location or a collector's spelling alone. How it was reached stays evidence.
- **R3** No client is required to exist before it is observed; no list claims to be complete; visibility of all clients is never assumed. An observation with no client mapping stays valid and readable (a collection written today needs nothing added).
- **R4** Original carrier bytes, client-relative source paths, hashes and outcomes of every collection stay exactly as written. Nothing in a collection is edited, moved or re-hashed by this Change.
- **R5** Relating an observation to a client is an explicit, recorded act with its provenance (who made it is not claimed; which attempt and which evidence it rests on is). It is never inferred from a name or from identical bytes.
- **R6** Records are written once. A correction or a changed judgement is another record that refers to the first by `{name, id}`; the first stays.
- **R7** Two independent collectors who meet the same client must not be forced to coordinate. If they mint two clients, KAAL can later record, explicitly, that they are one, without losing either history.
- **R8** Identical bytes from two clients are two communications. The same client presenting the same bytes again is the same communication, sighted again. The same client presenting other bytes at the same path is another carrier and another communication, never an overwrite.
- **R9** KAAL can answer, from records alone and offline: which client supplied which evidence; when each sighting was observed (as declared by the collection); in which collections a carrier or communication was sighted.
- **R10** A reader of those answers can see whether each rests on an explicit mapping or on none, and any carrier whose bytes no longer match is reported, not answered around.
- **R11** The existing sealed Node `Collecting KAAL` is not edited; any new meaning is born as a new Node typed by `Skill`.
- **R12** Existing Collection behaviour and its acceptance stay green. Reuse is preferred to a second parser of `reach.md`.
- **R13** Nothing in Core, `.github` or any sealed artifact is touched by this Change; what the new root-level entities need from `.github` is named as a later, separate Change.

## Out of scope (named so it is not assumed)

Sealing collections; an instant of observation; interpreting, ranking or acting on what is collected; deciding which clients to attempt.
