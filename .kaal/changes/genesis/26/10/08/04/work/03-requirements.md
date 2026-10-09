# Requirements (draft, reduced for Owner alignment)

Against the fixed Intent (`01-intent.md`) and the Owner's direction on PR #70, second round: repository-owned Clients, Requests and Incidents live outside the installed `.kaal/`; a locally minted stable client identity is a starting point, not a framework; Collection may persist source attribution and explicit relationships without becoming an interpretation capability; stored Requests and Incidents; the declared collection date is a declaration, never a verified instant.

## Identities that are genuinely required

| Identity | Meaning | Kind |
|---|---|---|
| Client | A local record that this KAAL has sighted something it calls `<name>`. A local assertion by the collector, never proof that two sightings are one client. | Required |
| Carrier | SHA-256 of the exact bytes. | Exists |
| Communication (Request or Incident) | One carrier as supplied by one client: the pair (client, carrier hash). | Required, but only a name for the pair |
| Collection observation | `collections/YY/MM/DD/CC/<name>/`, the raw record, with a declared date. | Exists |

Not required, and not built: a minted opaque ID or nonce, reconciliation of two clients as one, a client-declared token, a stored list of "all" clients, an observed instant.

## Requirements

- **R1** The four things above are never one set: a communication is not its carrier, a client is not its transport, a collection address is not a client, a path is not identity.
- **R2** Original carrier bytes, client-relative source paths, hashes and outcomes of every collection stay exactly as written; this Change edits no existing collection.
- **R3** The same client's same bytes seen again is one Request or Incident sighted again; the same bytes from another client are another one; other bytes from the same client are another one, even at the same path.
- **R4** Relating an attempt to a client is an explicit act of the collector, recorded; it is never inferred from a name or from matching bytes. A name that already has a client record is refused unless the collector explicitly asserts continuity, and the sighting then says that continuity was asserted by the collector. The assertion is stated as an assertion and is never presented as proof of identity.
- **R5** Requests and Incidents are durable records kept outside `.kaal/`, byte-exact as carried, written once, never replaced.
- **R6** Every sighting is kept, with the collection it came from, so the answers to which client supplied which evidence, in which collections, and as declared on which date, come from records alone.
- **R7** The declared collection date is always presented as a declaration.
- **R8** Nothing requires a client to exist beforehand, nothing claims completeness, and no identity depends on transport or provider. A client directory recording sightings is not a claim that KAAL knows all clients; the capability's own text states that limitation explicitly. Without the optional records argument, `collect.mjs` behaves exactly as today.
- **R9** A check reports any record whose bytes no longer match its name, any sighting naming a missing collection or communication, and any observed carrier with no stored copy.
- **R10** Clients, Requests, Incidents and collections are Record, kept distinct from the installed Engine, at an explicit location supplied by the caller. No universal root is assumed; the locator direction is the one closed Change `genesis/26/10/08/03` (#71) established, and this Change adds none of its own. The sealed Node `Collecting KAAL`, Changing contract, host checks, `.github`, Core and all sealed artifacts are untouched. What protects the new directories is a later `.github` Change.

## Out of scope

Reconciling clients; sealing; an observed instant; ranking, interpreting or acting on collected material; deciding which clients to attempt.
