# Package size measurement: Architecture

Each element names, in brackets, the Requirements it answers.

- **packaging/A1** [packaging/F1–packaging/F5, packaging/N3]: A `Packaging` KAAL Capability Node states the whole concern: how KAAL's deliverables become packages and what those packages are, in any ecosystem. The Node is not npm-specific, and it does not limit Packaging to measurement. This increment delivers one package, `packages/kaal-packaging`, which is private and depends on `kaal-hosting` and `kaal-foundation` only. Its README states its own interface and boundaries: what it measures, which ecosystems it reads, and what it does not do (produce packages, judge sizes).
- **packaging/A2** [packaging/I3]: Engineering invokes it. A driver, `engineering/packaging/measure.mjs` with `npm run size`, measures each tarball that `pack()` already packed once, compares it with the caller's previous record, and writes the report. The driver is Engineering's and lands in an Engineering Change after `packaging/C2`. Whether a result gates anything is Engineering's decision, through its own Control Nodes.
- **packaging/A3** [packaging/I3, packaging/N2]: Products are measured from outside. No product imports Packaging, so Guard keeps no dependencies. A product that wants a size constraint states it in its own documents and checks it against Packaging's report in its own Change.
- **packaging/A5** [packaging/F1] (amended by `packaging/C3`): Ecosystem realizations. The measurement and record forms are ecosystem-neutral. Each ecosystem has its own realization behind `measure`, which asks that ecosystem's tooling (packaging/A6). The first realization is npm's. Whether a later ecosystem ships in this package or as its own independently consumable package is decided when it arrives. No consumer is required to depend on more than one package.
- **packaging/A4**: The boundary with Testing. Testing measures test evidence: coverage, line inventory and attribution of lines to owners. Packaging measures delivered bytes. Neither imports the other. Testing's README line, that what a package delivers is the caller's to decide, stays true: deciding is Engineering's, measuring is Packaging's.

## The Changes

| Change | Owner | Depends on |
| --- | --- | --- |
| `packaging/C1` PLAN, this Change, into `kaal/packaging` | Packaging | |
| `packaging/C2` DO: the package, its Capability Node, GREEN tests | Packaging | `packaging/C1` |
| Engineering's driver and `npm run size` | Engineering | `packaging/C2` |
| promotion `kaal/packaging` → main | Packaging | `packaging/C2`, by the one-pair queue |

## Decided by the Owner (#596)

- **Scope.** Packaging owns the broader packaging concern, and measurement is its first increment. Producing packages moves from Engineering only through later Changes, each authorized on its own. Engineering invokes the current packer meanwhile.
- **Its own Capability.** It is not a module of Testing or of Engineering.
- **Ecosystems.** There is no npm-only conceptual model and no mandatory multi-package dependency. Each delivered package describes its own interface and boundaries.

## Amended in `packaging/C3` (the Owner's review on #614)

`packaging/C2`'s first DO read npm artifacts with its own gzip, DEFLATE and tar parser. From Packaging's seat that was the wrong owner. A KAAL package's delivered contents are what its ecosystem delivers, and the ecosystem's own tooling is the authority on that. A second parser can disagree with it, and its correctness and resource safety then become Packaging's to maintain, for formats Packaging does not own.

- **packaging/A6** [packaging/F1, packaging/F6, packaging/N3, packaging/N4]: Ecosystem tooling through Hosting.
  - The npm realization runs `npm pack <artifact> --dry-run --json --ignore-scripts --offline` through `kaal-hosting`'s `execute`, and maps npm's report into the description. npm states each file's path and size, the entry count and the unpacked size of the artifact it was given.
  - The packed size and the SHA-256 are taken from the artifact's own bytes, read through `kaal-hosting`'s `readFile`, never from the tool.
  - Hosting runs the command and knows nothing of npm. npm's semantics stay in Packaging's npm realization. Packaging parses no archive format.
  - Its dependencies are exactly `packaging/A1`'s: `kaal-hosting` and `kaal-foundation`.
- **What Packaging claims, and what it does not.** It claims the description it accepted, checked by `packaging/N4`. It does not claim the ecosystem tool's own robustness against a hostile artifact. That robustness is the tool's, as it is for every consumer who installs the package with that tool.
- **The interface, kept.** `attribute`, `compare`, `write`/`read` and `report` work on the description only, so they are unchanged. `measure` becomes asynchronous and takes the artifact's location, because its realization runs a tool. Groups stay prefixes the caller names. Grouping by a package's own declared parts, such as an Installation Contract's assets, is a later increment.
- **Where measurement runs.** It runs where the ecosystem's tool is installed, as it is in KAAL Engineering's lanes. Where the tool is missing, `measure` refuses and names it (`packaging/F6`).
- **Boundaries.** No other Capability changes. Hosting's `execute` and `readFile` are used as they are, and Engineering's driver is still planned after `packaging/C2`. A change to any of these returns to the Owner for alignment.

| Change | Owner | Depends on |
| --- | --- | --- |
| `packaging/C3` PLAN amendment, this Change | Packaging | `packaging/C1`; the Owner's review on #614 |
| `packaging/C2` DO, reworked to `packaging/A6`: the own reader removed, the amended tests GREEN | Packaging | `packaging/C3` |
