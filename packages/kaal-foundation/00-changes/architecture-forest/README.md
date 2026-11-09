# Foundation: the Architecture forest, stage 1 of the tree DO (C21)

Capability: Foundation. Target: `kaal/foundation`. Record number provisional until integration. Executes the landed tree PLAN (#1294); a landed PLAN is the go. This is stage 1 of the DO; later stages are separate Changes with their own exact-head review.

## What changes
- `03-architecture/architecture.md` becomes the forest: Solution (what ships: A1, A7, A9, A15, A16, A19 to A21), Delivery (A6, new A26 build/pack/accept layout, new A27 repository ownership claim, A22 to A25 from the PLAN), a "Held for kaal-packaging" subsection (A5, not ours), and a Cross-cutting section.
- Every element states, in brackets, the Requirements and Intents it answers.
- A7 is split: the delivery rows (checks, `dist/`, `npm test`) move to the new Delivery element A26.
- A25 carries the index of the held items and their Cases.
- The Cross-cutting section lists each Requirement answered in both branches with its reason.

## Not changed here
No Case moved, no file moved, no build change. Remaining stages: build rule for `delivery`, collector replacing the hand-kept `test:publisher` list, `delivery/` folders, `tests` edges, ids for untitled Cases, splits, BEST suites. T64 and T69 turn GREEN with this stage; T65 to T68 and T70 stay RED until their stages.

## Not authorized
No promotion, version bump on main, SYNC, ledger entry, release dispatch or npm publication.
