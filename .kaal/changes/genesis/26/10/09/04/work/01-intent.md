Intent — Persistent, Client-Related KAAL Collection

Evolve "kaal-collecting" so collected evidence remains persistent and consistently attributable to its originating KAAL client across collection events.

A client may be collected repeatedly, potentially through different adapters. KAAL must be able to relate those observations to the same client without confusing client identity, collection identity and carrier identity.

Preserve original carrier bytes, source paths, hashes and collection outcomes. Previous collections must remain intact and independently inspectable.

Do not introduce a mandatory central client registry, assume visibility of all clients, or make client identity dependent on a particular transport or provider.

Investigate what the existing Collection capability already guarantees and establish only the smallest missing mechanism.

Desired outcome: KAAL can reliably answer which client supplied which evidence, when it was observed, and whether the same carrier was encountered in multiple collections.
