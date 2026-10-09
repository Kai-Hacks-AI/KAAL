# Architecture (draft, reduced)

`trace`, a sibling capability, nonce identities and reconciliation are all withdrawn. What remains is Collection persisting what it already observes, one level further.

## Tree

Under a records directory the caller supplies (by default none, so today's behaviour is unchanged). It is Record, at an explicit location, never a universal root and never inside the installed Engine unless the caller chooses so:

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

## Sealed Node

`Collecting KAAL` is sealed and says Collecting "keeps no list of clients, so that what is visible is never mistaken for what exists". Its meaning is unchanged. A client directory records sightings and nothing else: it is the place a collector's own sightings are kept, not a claim that KAAL knows all clients, and `SKILL.md` and the directory's own README state that limitation explicitly. The Owner accepted this reading on PR #70.

## Honest limits

A different spelling of a name is a different client, and two sightings under one name are one client only because the collector asserted it. Carrier bytes exist twice (observation and stored record). Records are unprotected until a later `.github` Change.

## Choices, as the Owner resolved them on PR #70

- The sealed Node's meaning stays; the limitation above is documented.
- An existing client name is refused unless the collector explicitly asserts continuity, recorded as an assertion.
- The records location is supplied by the caller, coordinated with the Record-location direction of `genesis/26/10/08/03`.
