# Change Isolation transition ledger: inert rule DO

Owner: Engineering. Target: kaal/engineering. Ordinary working Change delivering step 2
of the Owner-approved admission route (PLAN #854, Route A). Record numbering is
provisional until integration.

Adds to engineering/change-isolation/check.mjs one narrow rule: a change whose complete
path set and per-path Git blobs equal an entry in a ledger held by the target is not judged
by Core-travels-alone. Adds an empty transitions.json, the adapter wiring that reads it from
the target's tip, a README, and tests added to check.test.mjs. Existing tests are unchanged.

The ledger holds no entry, so every change is judged as before. The rules for .github and
the existing cases are unchanged. No ledger entry, no workflow, no package, manifest or lock
change. Tests: 34 pass (22 existing, 12 new). Three mutations of the rule each fail the new
tests. The workflow is not touched; the adapter passes the new arguments only when the target
holds the ledger.

No synchronization, promotion or publication. Auto-merge is enabled; approval and required
checks govern.
