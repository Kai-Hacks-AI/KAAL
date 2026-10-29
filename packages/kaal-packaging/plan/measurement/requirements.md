# Package size measurement: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **packaging/F1** [packaging/I1] (amended by `packaging/C3`): `measure(artifact)` takes the location of a package artifact and resolves to its description: its identity, its packed size and SHA-256 from the artifact's own bytes, and every delivered file's path and size as the ecosystem's own tooling reports them. The description is the same for every ecosystem. Obtaining it is an ecosystem realization's work, and the first realization asks npm. A second ecosystem, such as NuGet, adds a realization and changes no description.
- **packaging/F2** [packaging/I1]: `attribute(measurement, groups)` sums the files into groups the caller names by path prefix, such as `docs/` or `test/`. Every byte falls in exactly one group, or in `unattributed`, and the groups add up to the unpacked size.
- **packaging/F3** [packaging/I2]: `compare(before, after)` gives the change in packed and unpacked size, the change for each group and each path, and the paths added and removed.
- **packaging/F4** [packaging/I2] (amended by `packaging/C3`): A measurement can be written as a record and read back unchanged. The record holds the package's ecosystem, name, version and artifact SHA-256, the tool and version that described it, and the measurement. Where records are kept is the caller's choice.
- **packaging/F5** [packaging/I3]: `report` renders a measurement or a comparison as text and as JSON. It states sizes and deltas only.

## Nonfunctional

- **packaging/N1** [packaging/I1] (amended by `packaging/C3`): The same artifact, described by the same ecosystem tool version, always gives the same measurement, on every host. The record names that tool version, so a difference between two records can be traced to it.
- **packaging/N2** [packaging/I3]: Nothing in Packaging holds a budget, a threshold or a verdict. No output reads as pass or fail.
- **packaging/N3** [packaging/I1] (amended by `packaging/C3`): Packaging imports no host module and parses no archive or compression format. Anything it needs from the host, including running an ecosystem's tool, comes through `kaal-hosting`, and SHA-256 comes from `kaal-foundation`.

## Not in this Change

- Producing packages. `engineering/delivery/pack.mjs` stays Engineering's, and Engineering keeps invoking it, until a later Change authorized on its own moves it.
- Any product's size constraint, including Guard's. `guard/C117`'s decision, None, stands.
- Publication. The package is `private`.

## Added in `packaging/C3`

- **packaging/F6** [packaging/I1]: When the ecosystem's tool is missing, cannot read the artifact, or reports something that is not a description, `measure` refuses with the tool and the reason named. It never guesses a size.
- **packaging/N4** [packaging/I1]: What Packaging accepts from a tool is bounded and checked. The number of files and each path's length have limits the caller can set. The files' sizes must add up to the unpacked size the tool reports. A path must be relative, with no `..` segment, and must appear once. Anything else is refused.
