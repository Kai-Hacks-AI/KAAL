# Requirements (draft, round 01 findings resolved)

Against the fixed Intent (`01-intent.md`), the Owner's directions on PR #70, and `review/01.md`. Clients, Requests, Incidents and collections are Record, kept distinct from the Engine, at an explicit location supplied by the caller. A directory of clients sighted is not a claim of complete client knowledge. The declared collection date is a declaration, never a verified instant.

## Identities that are genuinely required

| Identity | Meaning | Kind |
|---|---|---|
| Client record | The collector's local record that sightings were made under `<name>`. A local assertion, never proof of the originating installation's identity and never proof that two sightings share an origin. | Required |
| Carrier | SHA-256 of the exact bytes. | Exists |
| Stored carrier | The bytes kept once per (client record, hash), as evidence. The key deduplicates bytes; it asserts nothing about whether equal bytes came from one communication or from several. | Required, a storage key only |
| Collection observation | `collections/YY/MM/DD/CC/<name>/`, the raw record, with a declared date. | Exists |

Not required and not built: opaque IDs, reconciliation, client tokens, a list of "all" clients, an observed instant, any claim that two equal carriers are one Request or Incident.

## Requirements

- **R1** The four things above are never one set: a stored carrier is not a communication, a client record is not its transport or proof of origin, a collection address is not a client, a path is not identity.
- **R2** Original carrier bytes, client-relative source paths, hashes and outcomes of every collection stay exactly as written; this Change edits no existing collection.
- **R3** Equal bytes under one client record are stored once. Which carrier files they came from stays visible through the sightings, each of which lists `<sha>  <source path>`: the same path and bytes in two collections is that file seen again; equal bytes at two different paths are two carrier files with equal bytes, not asserted to be one communication or two (the existing Request writer can create exactly that: two writes of the same texts, two paths, one hash). The same bytes under another client record are stored again under that record; other bytes at the same path are another stored carrier, never an overwrite.
- **R4** Relating a sighting to a client record is an explicit act of the collector, recorded. A name with no record is the client's founding sighting. A name that already has a record is refused unless the collector passes `--continues`, and that sighting then carries the line `continues: asserted`, which states an assertion and is never proof of identity. `--continues` on a name with no record is refused. This holds for `unreached` as well as `reached`.
- **R5** Requests and Incidents are durable records held in the Record, byte-exact as carried, written once, never replaced.
- **R6** Every sighting is kept and names its collection, so which client record supplied which stored carrier, in which collections, as declared on which date, comes from the Record alone.
- **R7** The declared collection date is presented as a declaration wherever it is shown.
- **R8** Nothing requires a client to exist beforehand, nothing claims completeness, and nothing depends on transport or provider. The limitation that a client directory only records sightings is stated in the capability's text (`SKILL.md` and the package README); no file is written into the caller's Record. Without the opt-in switch `collect.mjs` behaves exactly as today.
- **R9** A check over the Record reports any stored carrier whose bytes no longer match its name, found by what it is and not only through surviving client records (one whose client record or sighting is gone is reported); any client record, including an empty one, without exactly one founding sighting; any sighting naming a missing collection or stored carrier; any observed carrier without a stored copy; any later sighting lacking `continues: asserted`. A Record that also holds locally authored dated carriers (`<place>/YY/MM/DD/CC.md`) is told apart by layout: a directory directly under `incidents/` or `requests/` is read as stored carriers when it holds a `<sha256>.md` file or has a client record.
- **R10** Everything `--keep` writes lies inside the Record: a destination whose existing parts are not plain directories is refused before anything is written, so nothing is written through a link. There is one Record location per use, the directory the caller passes as the first argument to every command, as today. It holds `collections/` and, when the switch is on, `clients/`, `incidents/`, `requests/` beside it. A sighting resolves its collection by address within that same Record, so it is unambiguous; the records of two Records are not combined, and a Record's addresses mean nothing outside it. Where the Record sits relative to any Engine is the caller's explicit choice and is never inferred from where the Engine is installed; colocating it in `.kaal` is permitted, and separating it is the intended use. No universal root, locator implementation, migration or Changing-contract change belongs here.
- **R11** The sealed Node `Collecting KAAL`, Changing contract, host checks, `.github`, Core and all sealed artifacts are untouched. What protects the new directories is a later `.github` Change.

## Out of scope

Reconciling clients; sealing; an observed instant; protecting or migrating records; ranking, interpreting or acting on collected material; deciding which clients to attempt.
