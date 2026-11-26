# Catalog only: Intent

This is `core/C156`, a PLAN Change. It ships no code. A DO turns its planned test GREEN.

Core lists what an Engine holds in one way, `catalog`. The older `capabilities(dir)` lists a part of the same: the Skills and Exchanges. It has been deprecated since `catalog` replaced it, and it is the only function Core exports for a purpose another already serves.

- **core/I43.** Core offers one way to list what an Engine holds, `catalog`, and no second spelling of a part of it. kaal-core 0.0.1 is unpublished, so no consumer has to migrate.

Not in this Change: any new listing across several Engines or folders, which no one has asked for, and Engineering's embed Acceptance Case, which calls `capabilities`. Engineering updates it in its own Change. `core/C156` lists it in its change graph and does not do it.
