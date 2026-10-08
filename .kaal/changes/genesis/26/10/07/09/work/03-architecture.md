# Architecture

One capability, `kaal-collecting`, shaped as the capabilities before it: a sealed Node `Collecting KAAL` typed by `Skill`, one Agent Skill with one script, and acceptance in `engineering/kaal-collecting`. No Core, `.github`, Sealing, Changing or installer change.

## The relationship

```
KAAL client → available adapter → exposed KAAL carriers → collection by KAAL
```

- **Client**: another installation of KAAL, which may carry communication addressed to KAAL.
- **Exposure**: what the client has addressed to KAAL within its embedded KAAL: the carriers in `incidents/` and `requests/` of its KAAL directory. That is the client's decision and the only thing collection may read of it.
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
- `reached <kaal-dir> <collection> --client <name> --adapter <text> --from <client-kaal-dir>` records a reached client. `<client-kaal-dir>` is the directory the adapter made of the client's KAAL directory. Of it the script reads only `incidents/` and `requests/`, a single list in the script, and copies the regular files under them, verbatim, at the path each was carried at, refuses symlinks and anything that is not a plain file, refuses to replace a client already in that collection (a refused or racing attempt removes only what it wrote itself), refuses names Git cannot carry faithfully (`.git*`), and reads nothing else of `<client-kaal-dir>`, not even to list it.
- `unreached <kaal-dir> <collection> --client <name> --adapter <text> --reason <text>` records an attempt that did not reach.
- `check <kaal-dir> <collection>` recomputes each carrier's identity against `reach.md` and exits 0 only if every one still matches, nothing is recorded twice, and nothing else (a symlink, a stray file) is in the record.

A client KAAL directory that holds no carrier is a legitimate result when the agent saw that the client carries none: reached, and nothing carried for KAAL. An exposure the agent could not see is `unreached`, never an empty one. Collection performs no network access and names no transport. It keeps collected evidence in `collections/` of the KAAL directory, local instance-owned state beside `changes/` and the carriers: not a delivery of any package, not read or written by installing, and with no sealing requirement and no general state framework. Fetching is the agent's, through whatever it has.

## The carriers as admitted (R11)

KAAL Incident and KAAL Request, admitted into KAAL before this Work resumed, carry each carrier as a plain file `incidents/YY/MM/DD/CC.md` or `requests/YY/MM/DD/CC.md` within the client's KAAL directory. This Work was first built on a provisional `carriers/` assumption, made while they were still being created, and is reconciled to what they actually are. The two directory names are one list in the script; collection does not import, install or depend on those capabilities, and parses nothing of a carrier's form. A further kind of carrier would be one more entry in that list, decided by whoever establishes it.

## What this does not do

It does not discover clients, enumerate a population, schedule or repeat collection, deduplicate across runs, interpret or sort carriers, seal a collection, or open Issues, Changes or backlog entries. Sealing a collection is possible later with the Sealing capability's tree identity, and is a separate decision. Interpretation, prioritization and action are other concerns, each for its own Change.
