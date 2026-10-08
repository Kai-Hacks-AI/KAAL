# Architecture (draft, reduced)

`trace`, a sibling capability, nonce identities and reconciliation are all withdrawn. What remains is Collection persisting what it already observes, one level further.

## Tree

Under a repository-owned records directory the collector names (by default none, so today's behaviour is unchanged), beside but outside `.kaal/`:

```
clients/<name>/sightings/YY/MM/DD/CC.md      one per attempt that reached or failed to reach it, written once
incidents/<name>/<sha256>.md                 the carrier bytes exactly, once per (client, hash)
requests/<name>/<sha256>.md
```

`<name>` is the collector's stable name (existing grammar). A client exists exactly when it has a sighting; no `client.md`, no list, nothing that could be read as "all clients".

A sighting is the same form `reach.md` already has (outcome, adapter, then `<sha>  <path>` per carrier) plus one line naming the collection it came from. It is the explicit mapping: attempt, client, carriers seen and the source path each was carried at. The date is the collection's declared date, in the file's own address.

## One example (Enercon, real data)

```
collections/26/10/08/01/enercon/…                 raw observation, unchanged
clients/enercon/sightings/26/10/08/01.md          collection 26/10/08/01; reached; b30c8bba… incidents/26/10/08/01.md ; 047bf093… requests/26/10/08/01.md
incidents/enercon/b30c8bba…66bb.md                the carrier
requests/enercon/047bf093…a831.md
```
A second collection that sees the same bytes writes `clients/enercon/sightings/26/10/09/01.md` and finds both stored copies already present and equal, so writes nothing else. A collection that finds other bytes at the same path stores a new communication and lists the path again in its sighting. A client seen under another spelling is another client; nothing links them.

## Reuse of existing Collection mechanics

`begin`, `reached`, `unreached` and the collection layout unchanged; the name grammar; SHA-256; the carrier walk and its refusals (symlinks, non-files, Git names, case clashes); the write-then-undo discipline; `reach.md` rendering, reused for the sighting form; `check`'s strict reading, extended to the records. The act is one more step inside `reached` and `unreached` when the records argument is given, so the persistence is part of recording the attempt, not a second tool.

## Sealed Node finding

`Collecting KAAL` is sealed and says Collecting "keeps no list of clients, so that what is visible is never mistaken for what exists". A `clients/` tree of clients sighted is not a list of clients that exist, but it is the nearest thing to one, and the Node cannot be edited (and the installer has no supersession for a registered Skill Node). Reading: a client directory is only the place its sightings are kept, claims nothing about absent clients, and says so in its own README. This is the concrete point where the Node's text and the Owner's model touch, and it is the Owner's to accept.

## Honest limits

A different spelling of a name is a different client, and two sightings under one name are one client only because the collector asserted it. Carrier bytes exist twice (observation and stored record). Records are unprotected until a later `.github` Change.

## Remaining forks

**A.** Accept the reading of the sealed Node above, or require a new Node (blocked on supersession).
**B.** Refuse an existing client name without an assertion flag (recommended), or accept the name silently as today.
**C.** Records directory passed per command, or a convention rooted at the repository: the first leaves the engine-versus-repository transition undecided, which fits your instruction.
