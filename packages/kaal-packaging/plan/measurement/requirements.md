# Package size measurement: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **packaging/F1** [packaging/I1]: `measure(artifact)` takes the bytes of a package artifact and returns its packed size, its unpacked size, and every file's path and size, read from the artifact itself. The measurement is the same for every ecosystem. Reading an artifact's format is the work of an ecosystem realization, and the first one reads npm tarballs (`.tgz`). A second ecosystem, such as NuGet (`.nupkg`), adds a realization and changes no measurement.
- **packaging/F2** [packaging/I1]: `attribute(measurement, groups)` sums the files into groups the caller names by path prefix, such as `docs/` or `test/`. Every byte falls in exactly one group, or in `unattributed`, and the groups add up to the unpacked size.
- **packaging/F3** [packaging/I2]: `compare(before, after)` gives the change in packed and unpacked size, the change for each group and each path, and the paths added and removed.
- **packaging/F4** [packaging/I2]: A measurement can be written as a record and read back unchanged. The record holds the package's ecosystem, name, version and artifact SHA-256, and the measurement. Where records are kept is the caller's choice.
- **packaging/F5** [packaging/I3]: `report` renders a measurement or a comparison as text and as JSON. It states sizes and deltas only.

## Nonfunctional

- **packaging/N1** [packaging/I1]: The same tarball bytes always give the same measurement, on every host.
- **packaging/N2** [packaging/I3]: Nothing in Packaging holds a budget, a threshold or a verdict. No output reads as pass or fail.
- **packaging/N3** [packaging/I1]: Packaging imports no host module. Anything it needs from the host comes through `kaal-hosting`, and SHA-256 comes from `kaal-foundation`.

## Not in this Change

- Producing packages. `engineering/delivery/pack.mjs` stays Engineering's, and Engineering keeps invoking it, until a later Change authorized on its own moves it.
- Any product's size constraint, including Guard's. `guard/C117`'s decision, None, stands.
- Publication. The package is `private`.
