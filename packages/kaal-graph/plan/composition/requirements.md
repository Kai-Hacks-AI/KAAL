# Composing reach, reverse and cycles: Requirements

Each Requirement names, in brackets, the Intents it serves.

- **graph/F4** (restated) [graph/I2, graph/I7]: An identity is any string. `successors` maps each identity to the identities it points to, as any of:
  - a `Map`;
  - a read-only relation with Map's reading interface, such as the one `reverse` returns, read through its `entries()`;
  - a plain object.

  A successor that is not a key is an identity with no successors. Resolving or refusing it is the caller's.

  This restates graph/F4 of `graph/C2`, which named only a `Map` or a plain object while `edges.d.ts` already typed `successors` as `ReadonlyMap | Record`. Nothing else changes.
