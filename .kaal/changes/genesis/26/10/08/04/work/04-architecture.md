# Architecture (draft, round 01 findings resolved)

`trace`, a sibling capability, nonce identities and reconciliation stay withdrawn. Collection persists what it already observes, one level further, inside one Record.

## One Record, three roles kept apart

- **Engine**: the installed KAAL and the Skill that provides `collect.mjs`, wherever they are installed.
- **Subject**: the client's KAAL directory, shown to the agent by whatever means it has; only `incidents/` and `requests/` of it are read, as today.
- **Record**: the directory the caller passes as the first argument. Today it is called `<kaal-dir>` and holds `collections/`. With the opt-in switch it also holds the clients and their stored carriers beside it. It need not be, and for the intended use is not, inside the Engine.

```
<record>/collections/YY/MM/DD/CC/<name>/reach.md, carriers/…      raw observation, unchanged
<record>/clients/<name>/sightings/YY/MM/DD/CC.md                   one per attempt, written once
<record>/incidents/<name>/<sha256>.md                              stored carrier, byte-exact, once per (client record, hash)
<record>/requests/<name>/<sha256>.md
```

A client record exists exactly when it has a sighting: no `client.md`, no list. A sighting's address equals its collection's address, and it is resolved within the same Record, so it can never meet another store's `26/10/09/01`.

## Sighting form (reuses the `reach.md` form)

```
# enercon

collection: collections/26/10/09/01
reached
adapter: <text>
continues: asserted            <- absent in the founding sighting, required in every later one
                                  (unreached adds `reason: <text>` as today, then the same line)
<sha>  <source path>
<sha>  <source path>
```

First use of a name: no `continues:` line. Reuse: refused without `--continues`, written with `continues: asserted` otherwise. An `unreached` attempt follows the same rule. The strict reading in `check` requires exactly one founding sighting per client record and the line in every other. The line records that the collector asserted continuity; it is neither proof of identity nor of the originating installation.

## External example

```
engine   /opt/kaal-engine/skills/kaal-collecting/scripts/collect.mjs          (anywhere)
subject  /tmp/exposed        (what an adapter showed of the client's KAAL directory)
record   /work/kaal-record   (chosen by the caller)

collect.mjs begin   /work/kaal-record
collect.mjs reached /work/kaal-record collections/26/10/09/01 --client enercon --adapter … --from /tmp/exposed --keep
collect.mjs reached /work/kaal-record collections/26/10/10/01 --client enercon --adapter … --from /tmp/exposed --keep --continues
```
The second repeats the name, so it is refused without `--continues`; with it, it writes `clients/enercon/sightings/26/10/10/01.md` with `continues: asserted`, finds the stored carriers already present and equal, and writes nothing else. Without `--keep` both commands behave exactly as they do today.

## Equal bytes, in this Record

A Request writer called twice with the same texts gives `requests/26/10/09/01.md` and `02.md`, one hash. Collected once, the sighting lists both paths against the same hash and a single stored carrier exists. KAAL has not said they are one communication, and has not said they are two. A reader sees two source paths and one stored copy. The same bytes from another client record are stored again under that record.

## Reuse of existing Collection mechanics

`begin`, `reached`, `unreached` and the collection layout unchanged; the name grammar; SHA-256; the carrier walk and its refusals; the write-then-undo discipline; `reach.md` rendering reused for the sighting; `check`'s strict reading, extended by a check over the Record (R9). The new step is inside `reached` and `unreached` behind the switch, so persistence is part of recording the attempt, not a second tool.

## Sealed Node

`Collecting KAAL` says Collecting "keeps no list of clients, so that what is visible is never mistaken for what exists". Its meaning is unchanged. A client directory records sightings only; it is not a claim that KAAL knows all clients, stated in `SKILL.md` and in the README of the records. The Owner accepted this reading on PR #70.

## Honest limits

A different spelling of a name is a different client record, and two sightings under one name are one client record only because the collector asserted it. Carrier bytes exist twice (observation and stored carrier). Records are unprotected until a later `.github` Change.

## Choices, as the Owner resolved them on PR #70

Sealed Node meaning stays; reuse of a name needs an explicit assertion, recorded; the Record location is supplied by the caller.
