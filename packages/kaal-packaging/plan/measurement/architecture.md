# Package size measurement: Architecture

Each element names, in brackets, the Requirements it answers.

- **packaging/A1** [packaging/F1–packaging/F5, packaging/N3]: A `Packaging` KAAL Capability Node states the whole concern: how KAAL's deliverables become packages and what those packages are, in any ecosystem. The Node is not npm-specific, and it does not limit Packaging to measurement. This increment delivers one package, `packages/kaal-packaging`, which is private and depends on `kaal-hosting` and `kaal-foundation` only. Its README states its own interface and boundaries: what it measures, which ecosystems it reads, and what it does not do (produce packages, judge sizes).
- **packaging/A2** [packaging/I3]: Engineering invokes it. A driver, `engineering/packaging/measure.mjs` with `npm run size`, measures each tarball that `pack()` already packed once, compares it with the caller's previous record, and writes the report. The driver is Engineering's and lands in an Engineering Change after `packaging/C2`. Whether a result gates anything is Engineering's decision, through its own Control Nodes.
- **packaging/A3** [packaging/I3, packaging/N2]: Products are measured from outside. No product imports Packaging, so Guard keeps no dependencies. A product that wants a size constraint states it in its own documents and checks it against Packaging's report in its own Change.
- **packaging/A5** [packaging/F1]: Ecosystem realizations. The measurement and record forms are ecosystem-neutral. Each ecosystem's artifact reader is a separate realization behind `measure`, and the first one reads npm. Whether a later ecosystem ships in this package or as its own independently consumable package is decided when it arrives. No consumer is required to depend on more than one package.
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
