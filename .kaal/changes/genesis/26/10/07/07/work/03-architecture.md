# Architecture

One capability, `kaal-collecting`, shaped as the capabilities before it: a sealed Node `Collecting KAAL` typed by `Skill`, one Agent Skill with one script, and acceptance in `engineering/kaal-collecting`. No Core, `.github`, Sealing, Changing or installer change.

## The relationship

```
KAAL client → available adapter → exposed KAAL carriers → collection by KAAL
```

- **Client**: another installation of KAAL, which may carry communication addressed to KAAL.
- **Exposure**: what the client has put within its embedded KAAL for KAAL to take. That is the client's decision and the only thing collection may read of it.
- **Adapter**: anything available to the collecting agent that shows it a client's exposure: a checkout it already has, a host's file interface, an archive somebody handed over. It is not part of collection. It is the agent's means, and is named in the record only as evidence.
- **Collection**: the dated KAAL-side record of one run, holding for each client it attempted either the exposure it brought in or the reason it could not.

## Where the three things live

| | lives in | stored by collection |
|---|---|---|
| known client | the collecting agent's knowledge and whatever adapters it has | nothing |
| reachable client | one attempt's outcome, `reached` or `unreached` plus a reason | the attempt |
| all clients | nowhere | nothing, ever |

There is no list of clients, so "visible" cannot be mistaken for "all". A client appears in KAAL only because an attempt on it was recorded, and a client absent from every collection is simply not known to have been tried.

## The record

```
<kaal-dir>/collections/YY/MM/DD/CC/        one collection (a run), allocated as Changes are
└── <client>/                              one attempted client, the collector's name for it
    ├── reach.md                           the attempt's outcome and evidence
    └── carriers/<path as carried>         verbatim bytes of each exposed carrier (reached only)
```

`reach.md` is plain and written by the script, never by hand:

```
# <client>

reached | unreached
adapter: <free text, how the collector reached or tried>
reason: <unreached only>

<sha-256>  <path as carried>      one line per carrier, reached only
```

`<client>` is a lowercase name of letters, digits and single hyphens. It is the collector's own name for the client: stable across runs, never a URL or a path, so the same client reached by two different adapters keeps one name, and the record never depends on a transport. Naming a client is a claim by the collector that collection records and cannot verify.

A carrier's identity is the SHA-256 of its exact bytes; it is its file name's companion in `reach.md`, so the pair *(client, carrier identity)* names where it came from and what it is. `YY/MM/DD/CC` gives when, and an agent allocates the next `CC` with the same rule as a Change (highest plus one, no reused gap, refused at 99).

## The script

`collect.mjs`, the only script, with three acts and a check:

- `begin <kaal-dir> [--date YYYY-MM-DD]` creates the next collection directory (today in UTC unless a real date from 2000 to 2099 is given) and prints its path. Two concurrent runs never share a number: the one that finds it taken takes the next.
- `reached <kaal-dir> <collection> --client <name> --adapter <text> --from <dir>` records a reached client. `<dir>` is the directory the adapter made of the client's exposure. The script copies the regular files under it, verbatim, refuses symlinks and anything that is not a plain file, refuses to replace a client already in that collection (a refused or racing attempt removes only what it wrote itself), refuses names Git cannot carry faithfully (`.git*`), and reads nothing outside `<dir>`.
- `unreached <kaal-dir> <collection> --client <name> --adapter <text> --reason <text>` records an attempt that did not reach.
- `check <kaal-dir> <collection>` recomputes each carrier's identity against `reach.md` and exits 0 only if every one still matches, nothing is recorded twice, and nothing else (a symlink, a stray file) is in the record.

`--from` is the exposure boundary the adapter produced, and an empty directory is a legitimate exposure: the client was reached and carries nothing for KAAL. Collection performs no network access and names no transport. Fetching is the agent's, through whatever it has.

## The one assumption (R11)

Carriers are not yet defined; a concurrent Change creates them. This Work assumes only that a client carries KAAL-addressed carriers as plain files inside a single directory of its embedded KAAL, and that the collecting agent can have that directory shown to it. The Skill names `carriers/` of the client's KAAL directory as the default boundary the agent asks its adapter for, says it is an assumption, and says that an exposure the agent could not see is `unreached`, never an empty one. It is only a default for the agent's attention, the script takes whatever directory it is given, so replacing it with the carriers' own location changes one line of prose and no code. Nothing here depends on the carriers' file form or content.

## What this does not do

It does not discover clients, enumerate a population, schedule or repeat collection, deduplicate across runs, interpret or sort carriers, seal a collection, or open Issues, Changes or backlog entries. Sealing a collection is possible later with the Sealing capability's tree identity, and is a separate decision. Interpretation, prioritization and action are other concerns, each for its own Change.
