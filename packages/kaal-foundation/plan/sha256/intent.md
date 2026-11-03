# SHA-256: Intent

This is `foundation/C1`, a PLAN Change. It is Foundation's first Change. It ships no code. `foundation/C2`, a DO Change, turns the planned tests GREEN.

Foundation is a foundational Capability, a sibling of Hosting. It owns pure, deterministic primitives that other Capabilities share. It is also a deliberate collector for shared concerns whose eventual specialized home is not yet known. Each concern Foundation collects is named, reviewed and owned here provisionally, never by default.

KAAL hashes with SHA-256 in three places today. Graph uses `node:crypto` for every Node's id, and Core re-exports it. Guard has its own `node:crypto` hash. `core/C4`, still under review on #357, adds a pure implementation, because `core/T21` forbids host modules in `kaal-core/agent` and `kaal-core/installation`. Sealing, on `kaal/sealing`, imports Core's. None of these should own a competing generic SHA-256.

- **foundation/I1.** KAAL has one SHA-256, owned by Foundation. Any Capability can depend on it without a dependency cycle and without importing a host module.
- **foundation/I2.** Adopting it changes no digest. Every Node id, Seal and record digest stays byte-for-byte the same.
- **foundation/I3.** What Foundation holds is explicit, provisional and reviewable. It is not an uncontrolled utilities bucket.
