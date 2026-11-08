# Change Isolation transition ledger: inert rule, focused promotion to main

Owner: Engineering. Target: a focused collector for main (kaal/change-isolation-ledger).
Ordinary working Change delivering step 2 of the Owner-approved admission route (PLAN #854,
Route A; the rule was reviewed and approved as #862 on kaal/engineering, and Hosting's use
of it was approved in #866).

Adds to engineering/change-isolation/check.mjs one narrow rule: a change whose complete path
set and per-path Git blobs equal an entry in a ledger held by the target is not judged by
Core-travels-alone. Adds an empty transitions.json, the adapter wiring in
engineering/github/change-isolation.sh that reads the ledger from the target's tip, a README,
and tests added to check.test.mjs.

The ledger holds no entry, so every change is judged exactly as before. The rules for .github
and the existing cases are unchanged; existing tests are unchanged. Tests: 30 pass (15
existing on main, 15 new). The adapter passes the new arguments only when the target holds
the ledger. Git evidence: an absent path is null; a missing, invalid or unavailable revision,
or a non-file entry, is cannot-judge (exit 2).

Scope: only the ledger rule. Engineering-collector content not on main (the C16 root
governance helpers and the other collector Changes) is not carried. The rule must exist on
main for it to admit any promotion to main; this is that delivery.

No ledger entry, no workflow, package, manifest or lock change. No synchronization,
publication or ledger entry is performed. Auto-merge is enabled; approval and required checks
govern.
