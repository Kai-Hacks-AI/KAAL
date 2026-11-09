# Intent

Foundation holds the shared, pure and deterministic primitives that any KAAL package can build on without a dependency cycle. It depends on nothing, so it can sit beneath every other package.

- **foundation/I1** **One SHA-256 for KAAL.** Any package can depend on it without a dependency cycle and without importing a host module.
- **foundation/I2** **Adopting it changes no digest.** Every Node id, Seal and record digest stays byte for byte the same.
- **foundation/I3** **Explicit, provisional ownership.** Each concern Foundation holds is named and reviewed. It is not a utilities bucket, and a concern moves on once its specialized home is known.
- **foundation/I7** **It holds itself to its own bar.** An agent can use Foundation through a skill and a command, without writing JavaScript. Every installation checks itself: Foundation's own SHA-256 writes the manifest of what it ships, and the host's SHA-256 checks it.

- **foundation/I10** **Its declaration is its own.** An installed Foundation
  package supplies its authoritative Capability Node for explicitly requested
  Core registration. Foundation owns the bytes; Core owns registration.

- **foundation/I14** **It can find, anywhere it is pointed, what it owns being done somewhere else.**
  The byte-level SHA-256 is Foundation's (foundation/I1, foundation/I2). Its Boundary
  Check reports each place where it is done elsewhere, as a finding, and decides nothing:
  a finding is audit, not a fault, and "none found" is not compliance. It carries what it
  looks for and never where it looks, and it names no role. Only a consequence of a
  decision enters a package.

See [Requirements](../requirements/functional/requirements.md) for what this guarantees.
