# Foundation: carry forward the ids the Cases cite into the Nodes (DO)

Capability owner: Foundation. It prepares the architecture-tree DO (foundation/C21), whose Cases T65 and T70 need every
cited id to be defined in a Node. It changes no behaviour and ships no new code. It authorizes no promotion, version
bump on main, SYNC, ledger entry, release dispatch or npm publication.

Found while starting the tree DO: 25 ids cited by delivered Cases were defined in no Node, only in `00-changes/` records.
This Change defines them, plus I5 and I8 (cited by the Requirements it carries), in `01-intent`, `02-requirements` and
`03-architecture`, each placed by the Owner's two questions (ours or not ours, then Delivery or Solution).

- Ours, carried into the Nodes, reworded for the final layout: A6, F20, F21, I8, N3, N6 to N12.
- Not ours, carried into a "Held for kaal-packaging" section of each Node (Owner, 2026-11-09: held ids stay inside
  Foundation's Nodes): A5, F4 to F9, F11, F13, F16, F17, F19, I4 to I6. Targets in the inventory: kaal-packaging for A5,
  F4 to F8, F11, F19, I4 to I6; kaal-testing for F9, F13, F17; kaal-agents for F16. The tree DO adds the A25 index, the
  per-capability "Held for" sections and the `moved:` tombstone rule; here F9/F13/F17/F16 sit under the one section.
- Reworded: no version 0.0.1, no flat `docs/*.md` layout, no Test Plan, and nothing about what a consumer has or does
  (Owner ruling, 2026-11-09). Ids are never reused.
- Inventory and placement table: `foundation/carry-forward-inventory-0.0.2.md` in the project files.

Verified: every id cited by a delivered Case now resolves to a definition in a Node; `npm test` verified (11 Cases);
`npm run test:publisher` 46 of 46. `verify.json` regenerated (the Nodes ship).
