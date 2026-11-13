# C7 baseline

The baseline is `main`. Work that is not on `main` is not delivered functionality, and this Change depends on nothing that is not on `main`.

- `main` holds no document that states what the four types of control are for, how they cooperate or how they stay independent.
- `main` holds no `packages/kaal-controls/`. `engineering/controls/` is Engineering's own tooling and is not part of this Change.
- The earlier collector, now `kaal/old/controls`, holds a package with related semantics. It is not on `main` and is not promoted.
