# C1 baseline

The baseline is `main`. Work that is not on `main` is not delivered functionality, and this Change depends on nothing that is not on `main`.

- `main` holds no document that tells an agent how to classify a requirement as Solution, Delivery or Change, or as target-state or change-oriented.
- `main` holds `packages/kaal-controls/`, which is the shape this package follows, and `engineering/release-management/`, whose Change C4 is the first application.
- The package `kaal-architecture` (the Skill for URBAN) is on the collector `kaal/architecture`, not on `main`. This Change does not depend on it and does not touch it (`proposal.md`, section 2).
