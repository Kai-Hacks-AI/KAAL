# Architecture (D3, agreed result)

A ledger is an array of entries, each stored as `{ id, entry }`.

- The id of an appended entry is the number of entries in the array at that moment, plus one.
- `retract(id)` removes the matching `{ id, entry }` from the array.
- `append` refuses an entry that is not an object (R4).

This Change is authorized to realize this architecture. It is not authorized to revise it.
