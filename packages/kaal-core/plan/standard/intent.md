# Standards: Core's Definitions — Intent

This is `core/C34`, a PLAN Change. It ships no code. `core/C35`, its DO, turns its planned tests GREEN. It authorizes no synchronization, promotion or publication.

The Owner chose Option A on Engineering's PLAN #610 (review 5712653273): "Core owns the KAAL-wide `Standard`, `Applies to`, and shared scope Definitions through its own bounded Change."

The rest of the model is Engineering's (`engineering/C5`):
- Each Capability owns its own Standard instances.
- Engineering discovers them through Graph, derives a view without copying rules, and orchestrates conformance owned by each Standard's owner.

- **core/I25.** Every Capability states its standards with the same KAAL-wide concepts, and none of them owns another's.
  - Core defines what a Standard is, what applying it means, and the shared scopes it can apply to.
  - Core owns those meanings and nothing else: no Standard instance, no register, no view, and no enforcement.
  - Applicability is declared, never inferred. It is neither authorization nor evidence that anything ran. Missing Test Cases or evidence stay unresolved.
