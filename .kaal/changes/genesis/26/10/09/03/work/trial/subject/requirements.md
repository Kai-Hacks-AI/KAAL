# Requirements (D2, agreed)

R1. Every entry in a ledger has an id, and no two entries in the ledger, now or later, have the same id.
R2. `append(entry)` stores the entry and returns its id.
R3. `retract(id)` removes the entry with that id and returns true; for an id that is not in the ledger it returns false.
R4. Only objects are entries: `append` of anything else is refused by throwing a TypeError.
