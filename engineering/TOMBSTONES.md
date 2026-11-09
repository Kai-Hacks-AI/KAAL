---
name: TOMBSTONES
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# TOMBSTONES

Test Of Member Boundaries So That Ownership Navigation Enhances.

When a Node's owner is found elsewhere, the Node moves and leaves a tombstone, so that every edge that pointed at it still resolves and ownership can be navigated. The rules:

- **Born local, moved later.** Something may be born local (for example in Foundation), go live, and be refactored to its correct home later. That requires the placement homework up front: every Node placed and its target home named.
- **One-line tombstone.** A moved id leaves exactly one line in its old place: `moved: <capability>/<id> (<Change>)`. The resolver follows it.
- **Ids are never reused.** A tombstoned id stays taken.
- **Held Cases move with their definition.** A held Case moves together with the Node it tests, and its `tests` edge is rewritten at move time. The new owner never points back at the old place, even through a tombstone.
- **A check lists the tombstones still referenced.** Nothing else points at a tombstone silently.
- **Removing a tombstone is its own Change.**

TOMBSTONES is not a capability and not a sequence. It owns no Node it points at; each stays with its capability. Engineering owns this definition and the rules for now (Owner, 2026-11-09); the home may be decided later.
