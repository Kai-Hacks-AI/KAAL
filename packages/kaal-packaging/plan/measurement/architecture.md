# Package size measurement: Architecture

Each element names, in brackets, the Requirements it answers.

- **packaging/A1** [packaging/F1–packaging/F5, packaging/N3]: `packages/kaal-packaging` is a new workspace, private, typed by a `Packaging` KAAL Capability Node in its `payload/`. It depends on `kaal-hosting` and `kaal-foundation` only. Its Capability is measurement of what a package delivers, and nothing else.
- **packaging/A2** [packaging/I3]: Engineering invokes it. A driver, `engineering/packaging/measure.mjs` with `npm run size`, measures each tarball that `pack()` already packed once, compares it with the caller's previous record, and writes the report. The driver is Engineering's and lands in an Engineering Change after `packaging/C2`. Whether a result gates anything is Engineering's decision, through its own Control Nodes.
- **packaging/A3** [packaging/I3, packaging/N2]: Products are measured from outside. No product imports Packaging, so Guard keeps no dependencies. A product that wants a size constraint states it in its own documents and checks it against Packaging's report in its own Change.
- **packaging/A4**: The boundary with Testing. Testing measures test evidence: coverage, line inventory and attribution of lines to owners. Packaging measures delivered bytes. Neither imports the other. Testing's README line, that what a package delivers is the caller's to decide, stays true: deciding is Engineering's, measuring is Packaging's.

## The Changes

| Change | Owner | Depends on |
| --- | --- | --- |
| `packaging/C1` PLAN, this Change, into `kaal/packaging` | Packaging | |
| `packaging/C2` DO: the package, its Capability Node, GREEN tests | Packaging | `packaging/C1` |
| Engineering's driver and `npm run size` | Engineering | `packaging/C2` |
| promotion `kaal/packaging` → main | Packaging | `packaging/C2`, by the one-pair queue |

## Open decisions for the Owner

- **O1. Measurement only, or packing too?** Default: measurement only. Moving `pack()` from Engineering to Packaging would be a separate PLAN.
- **O2. A Capability of its own.** Default: yes, a new `Packaging` Capability with its own collector `kaal/packaging`, because measurement overlaps with neither Testing nor Engineering. The alternative is to place it in Testing as a fourth measurement module beside coverage, inventory and attribution.
