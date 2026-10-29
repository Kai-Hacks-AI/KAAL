# Intent

Foundation holds the shared, pure and deterministic primitives that any KAAL package can build on without a dependency cycle. It depends on nothing, so it can sit beneath every other package.

- **One SHA-256 for KAAL.** Any package can depend on it without importing a host module, and adopting it changes no digest.
- **Explicit, provisional ownership.** Each concern Foundation holds is named and reviewed. It is not a utilities bucket, and a concern moves on once its specialized home is known.

See [Requirements](requirements.md) for what this guarantees.
