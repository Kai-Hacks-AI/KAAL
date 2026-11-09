# Foundation: tree DO stage 3, every Case has an id and a placed target (C21)

Capability: Foundation. Target: `kaal/foundation`. Record number provisional until integration. Stage 3 of the landed tree PLAN (#1294); stages 1 and 2 are #1302 and #1303.

## What changes
- Untitled Cases get the next free ids: T71 (manifest currency), T72 to T74 (the shipped verifier's interface, foundation/F12). The fake Case `foundation/T999` in a fixture becomes the obviously fictitious `foundation/TX-undeclared`.
- Splits where one Case verified leaves of two branches: T35 (the Node, F20, Solution) and new T75 (the repository claim, F21, Delivery); T17 (cannot-verify cases, F17, Delivery) and new T76 (a wrong library is failed, F12 and N10, Solution). Ids are not reused; T35 and T17 keep their ids for their first halves.
- Targets that named an Architecture element or no element are fixed: T10 drops A5, T13 drops A6, T16 targets F17 only. F6 is added to the held A5 element; F12 is answered by A9 (Solution) alone, so A26 drops it.
- `verify.json` regenerated.

## Not done here
T66 (Cases leave the 04-test check folders), T70 (a `tests` edge in every Case file), the move into `delivery/` folders and the collector following them, the BEST suites and the `ships` flag. T15, T18, T46 and T47 stay whole: their targets are listed Cross-cutting Requirements, which T65 accepts; splitting them is a later stage if the Owner wants the Packaging placement in code.

## Verified
`npm run test:publisher` 42 of 42, `npm test` verified, T64, T65, T67, T68, T69 GREEN; T66 and T70 RED until stage 4.

## Not authorized
No promotion, version bump on main, SYNC, ledger entry, release dispatch or npm publication.
