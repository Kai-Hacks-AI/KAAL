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

- **foundation/I8** **Its location is its own.** Foundation states, in the repository, that `packages/kaal-foundation/` is its own location. A Change to it is traced to Foundation, as one is to Core, Graph or Testing. It claims nothing outside that folder.

## Held for kaal-packaging

Carried forward from the publication Change. They belong to kaal-packaging, which applies to every package, and are held here until it lands on main (foundation/I16). Each is placed: not ours, so a later cut and paste moves it.

- **foundation/I4** **Installable by itself.** `@kaihacksai/kaal-foundation` can be installed by itself from its packed artifact, and it works there exactly as it does in the workspace.
- **foundation/I5** **Ready to publish.** Foundation is ready to publish. Its name follows the Owner's `@kaihacksai/kaal-*` namespace.
- **foundation/I6** **Documents and an honest installed verdict.** The package ships concise documents that explain it, and a delivered `npm test` that verifies the installed copy and reports an honest result.

See [Requirements](../requirements/functional/requirements.md) for what this guarantees.
