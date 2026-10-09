# Investigation — what Collection already guarantees

Against `kaal/genesis` at 1679d40: the sealed Node `Collecting KAAL`, `packages/kaal-collecting/skills/kaal-collecting/SKILL.md`, `scripts/collect.mjs` and `engineering/kaal-collecting/acceptance`. The one real run (Enercon PR #3 head c357c50, collection `26/10/08/01`) and a scratch re-run of four collections (below) are the evidence.

## Three identities, as they stand

| Identity | What it is today | Held by | Enforced by |
|---|---|---|---|
| Client | The collector's own name: 1-64 lowercase letters, digits, single hyphens. "A name and not where it was found." | Node (name vs location); `SKILL.md` step 1 ("stable across collections") | Grammar only. Nothing links the name used in one collection to the name used in another, and "stable" is advice. |
| Collection | Its address `collections/YY/MM/DD/CC/`: UTC day (`--date` may name another) plus the next free number. | `collect.mjs begin` | Allocation only. Unsealed; "written once" is a rule, and `check` cannot see a record rewritten consistently with its carriers. |
| Carrier | The SHA-256 of its exact bytes; kept byte for byte at the path the client carried it at. | Node; `reach.md` line `<sha>  <path>` | `check`: every carrier still matches its recorded hash, nothing unrecorded, nothing missing. |

## What already holds, for each collection taken alone

- Original bytes, source path (client-relative) and hash are kept together, and one outcome per attempted client (`reached` or `unreached`, with `adapter:` and, for unreached, `reason:`).
- Nothing is replaced: a client already recorded in a collection is refused; `begin` never reuses a number; a refused `reached` writes nothing.
- No client list exists, and a collection speaks only of the attempts it recorded.
- Transport is evidence (`adapter:`), not identity. Nothing in the client name or the carriers depends on a provider.
- Previous collections stay independently inspectable: each is a directory whose `check` needs nothing outside it.

## What a scratch re-run shows is not there

Four collections of the real Enercon carriers (same bytes twice via different adapters; the same bytes under another client name; the same path with one byte appended):

- `check` passes for each, one at a time. There is **no operation across collections**. "Which collections saw this carrier" is a manual walk of every `reach.md`.
- The same carrier bytes appeared in three collections, under `enercon` and `enercon-fork`. Nothing says whether that is one client seen again, or two clients carrying a copy. Only the name differs, and the name is the collector's word.
- `incidents/26/10/08/01.md` appeared with two different hashes. The path is the client's own numbering, so a path is not a carrier's identity, and neither tells "the client changed it" from "a different carrier at the same address".
- "When" is the collection's UTC day and number. `--date` is accepted from the caller, so the date is what the collector declared, not what a clock observed. No time of day is recorded.
- `reach.md` has one free-text `adapter:` line. The source head or commit of a checkout is only text there.
- `reached` with no carriers is accepted from any directory (see `assessment/collection-limitations.md` of the first real collection); it does not bear on this Intent.

## Reading against the Intent

| Intent asks | Already answerable | Missing |
|---|---|---|
| Which client supplied which evidence | Within one collection, by directory | Across collections |
| When it was observed | The collection's address, as declared | A reader-facing answer; (optionally) an instant |
| Same carrier in multiple collections | Not without a manual scan | A way to ask |
| No registry, no assumed visibility, no transport dependence | Holds by construction | Must keep holding |
| Previous collections intact and inspectable | Per collection, by rule and `check` | Optionally: a seal that makes "intact" provable rather than ruled |

The sealed Node already states the meanings needed (client is a name, carrier is its bytes, a collection is written once and speaks only of its attempts). Nothing here requires changing it, and a sealed Node cannot be edited in place.

## The smallest mechanism that closes the gap

One read-only command, `collect.mjs trace <kaal-dir> [--client <name>] [--carrier <sha>]`, over the records that already exist. It reads every `collections/*/*/*/*/<client>/reach.md`, verifies each recorded carrier against its bytes (it refuses to answer from a record that does not check), and reports:

- per client name: its attempts in collection order, with outcome and adapter;
- per carrier hash: every collection, client name and path it was seen at.

It writes nothing, adds no field, and works unchanged on every collection already written. It does not merge client names and does not decide that two names are one client: that remains the reader's judgement, which is what keeps it from becoming a registry.

Everything else (an instant of observation, a client-declared identity, an alias relation, sealing collections) is deliberately not proposed and is put as a question instead.

Delivery would be `scripts/collect.mjs` and `SKILL.md` in `packages/kaal-collecting`, acceptance in `engineering/kaal-collecting`, and the self-install projection. No Core, `.github` or Node change.
