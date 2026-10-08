# Architecture (draft, with the genuine forks)

`collect.mjs trace` from the first proposal is withdrawn as the solution. It stays at most a reader over whatever model is chosen.

## The shape

```
 client's KAAL dir ─(adapter, any)─► collections/YY/MM/DD/CC/<name>/   observation, written once  (exists)
                                              │ reach.md: outcome, adapter, sha + path
                                              ▼   explicit, recorded act (new)
                      clients/<client>        who it is        ◄── mapping: attempt → client
                      incidents/<comm>        what was sent    ◄── client + carrier sha (+ kind)
                      requests/<comm>
```

- A **client** record is written the first time a collector decides an attempt shows a client it has no record of. Its ID is the SHA-256 of its own bytes; the bytes include a collector-chosen nonce, so two collectors minting for the same real client get two IDs and need no coordination (R7). The collector's name for it is an attribute, not identity.
- An **attempt-to-client mapping** is its own write-once record naming the collection address, the name used there and the client `{name, id}`. It is the one place the judgement "this attempt saw that client" lives (R5). `reach.md` is never touched (R4).
- A **communication** record (in `incidents/` or `requests/`, by the carrier's place of origin) refers to its client `{name, id}` and to the carrier's SHA-256. Its bytes are fully determined by those, so its ID is too: the same client and the same bytes always give the same communication, whoever writes it, and other bytes or another client give another one (R8). The path and date are provenance in the observation, not identity.
- **Sightings** (which collections saw a communication) are derived from observations plus mappings, not stored. They are a read.
- **Reconciliation** of two client IDs found to be one is a further write-once record referring to both.

## What existing Collection functions are reused

`begin`, `reached`, `unreached` and the whole collection layout unchanged; the SHA-256 and client-name grammar; the strict `reach.md` reading inside `check` (to be offered as one shared reader instead of a second parser, R12); `check`'s carrier verification, which every read here runs first.

## Minimum new mechanism

1. Write the three kinds of record above, each write-once, refusing to replace.
2. One check across them: every mapping names an existing attempt, every communication's carrier exists in some mapped collection with that hash, nothing dangles.
3. One read: for a client, a communication or a carrier hash, list what is known and whether it rests on a mapping.

Nothing else: no registry, no list of all clients, no inference, no transport field.

## Genuine forks for the Owner

**F1. Where the three entities live.** You agreed root-level `clients/`, `requests/`, `incidents/`. Consequences to accept: they are outside `.kaal/`, so `contain-change` and `preserve-sealed-changes` do not see them and nothing protects write-once until a later `.github` Change (which must travel alone); each directory needs its own README and boundary; the names `incidents/` and `requests/` also mean the client-side carrier places in a client's KAAL directory, so docs must keep "carried by a client" and "recorded by KAAL" apart. Alternative: inside `.kaal/` (protected by existing controls, but it is instance state). Recommendation: root-level as agreed, with a stated follow-up for protection.

**F2. Client identity.** (a) KAAL-minted record with nonce, reconciled by explicit record (recommended); (b) a token the client declares in its own KAAL, which cannot be required and which a fork or copy duplicates, so at most supporting evidence; (c) the collector's name only, which is today's weakness.

**F3. Which capability holds this.** The sealed Node `Collecting KAAL` says Collecting does not interpret, and deciding that an attempt shows a given client is interpretation. So either a new sibling capability (new Skill Node, own package, consuming collections; `kaal-collecting` gains at most a shared reader), or `kaal-collecting` is evolved and a new Node is born beside the sealed one. The fixed Intent says "evolve kaal-collecting"; the Node's scope suggests the sibling. Recommendation: sibling capability, with the collecting change limited to the shared reader.

**F4. Stored or derived communications.** Your model has them stored. I recommend stored with ID fully determined by client and carrier hash, sightings derived. The alternative is derived only, which would make `incidents/` and `requests/` views, not entities.

**F5. When it was observed.** The collection's address, as the collector declared it, stated plainly as a declaration. An instant would mean a second `reach.md` form and is still the collector's clock. Recommendation: no instant in this Change.
