# Requirements

What the Work must make true, from the Intent. Each is checkable on what ships.

**R1. Collection is a capability, not Core.** It joins an installed KAAL as a Skill through Core's existing registration, as any capability does. Core carries nothing of it, and it is not installed merely because KAAL is installed.

**R2. Three things stay three.** The Work gives *known*, *reachable* and *all* each a different home, and no artifact stands for more than one of them:
- *known*: a client someone can name. Collection stores no list of them.
- *reachable*: a fact about one attempt in one environment, never about a client. An attempt ends reached or unreached, and an unreached one keeps its reason.
- *all*: never asserted. Nothing counts, totals or declares a population, and no record can be read as saying a client is absent because it was not attempted.

**R3. No registry.** There is no file, Node or directory that is the set of clients. Knowing, discovering and reaching clients are not collapsed into one place.

**R4. Transport is an adapter's.** The capability's meaning and its script name no host, no transport, no protocol and no particular client. Whatever lets the collecting agent see what a client exposes is an adapter, and the capability meets it only as a directory that adapter produced.

**R5. The client decides what it exposes.** Collection reads only the KAAL-addressed carriers a client carries with its embedded KAAL, in `incidents/` and `requests/` of its KAAL directory where KAAL Incident and KAAL Request keep them. Of the client's KAAL directory it never reads, lists or copies anything else, and it refuses anything among the carriers that is not a plain file. It takes no ownership of them: it never alters, moves, parses or judges a carrier.

**R6. Identity is preserved, and not mistaken for a locator.** Each collected carrier keeps its exact bytes, the identity of those bytes (their SHA-256) and the path at which the client carried it. Each carrier stays attached to the client it came from, named by the collector's own name for that client, which is a name and not a location. The adapter and how the client was reached are recorded as evidence and are not identity.

**R7. Evidence only.** Collecting produces records and copies. It creates no Issue, Change, backlog entry, priority, verdict or decision, and it does not interpret a carrier. It does not read what a carrier says.

**R8. Nothing is lost or rewritten.** A collection is written once. A client already recorded in a collection is never replaced, and a collected carrier is never changed after it is written. A later attempt is another collection.

**R9. Honest about the run.** A collection records the attempts it made and says nothing about clients it did not attempt. An empty exposure (reached, nothing carried) is recorded as exactly that, apart from unreached.

**R10. Smallest.** One Node, one Agent Skill, one script. No daemon, no schedule, no polling, no registry, no new Core meaning, no change to Sealing, Changing or the installer.

**R11. Consumes the carriers as admitted.** KAAL Incident and KAAL Request carry their carriers as `incidents/YY/MM/DD/CC.md` and `requests/YY/MM/DD/CC.md` within the client's KAAL directory. Collection consumes exactly that location and keeps each carrier's source path, and needs nothing of their form but that they are plain files.
