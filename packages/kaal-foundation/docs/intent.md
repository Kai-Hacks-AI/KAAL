# Intent

Foundation holds the shared, pure and deterministic primitives that any KAAL package can build on without a dependency cycle. It depends on nothing, so it can sit beneath every other package.

- **foundation/I1** **One SHA-256 for KAAL.** Any package can depend on it without a dependency cycle and without importing a host module.
- **foundation/I2** **Adopting it changes no digest.** Every Node id, Seal and record digest stays byte for byte the same.
- **foundation/I3** **Explicit, provisional ownership.** Each concern Foundation holds is named and reviewed. It is not a utilities bucket, and a concern moves on once its specialized home is known.
- **foundation/I7** **It holds itself to its own bar.** An agent can use Foundation through a skill and a command, without writing JavaScript. Every installation checks itself: Foundation's own SHA-256 writes the manifest of what it ships, and the host's SHA-256 checks it.

See [Requirements](requirements.md) for what this guarantees.
