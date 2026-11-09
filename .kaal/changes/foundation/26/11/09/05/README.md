# Foundation: ship the Boundary Tests as a definition, not a scanner (replaces C14 / #1293's scan.mjs)

Capability: Foundation. Target: `kaal/foundation`. Record number provisional until integration. This is the replacement Change that Engineering's Boundary Engine PLAN (#1297, `engineering/boundary/PLAN.md`, "Replacement Change for C14 / #1293") requires, following the Owner's ruling of 2026-11-09 that Foundation 0.0.2 ships its Boundary Tests as data and no scanner. A landed PLAN is the go.

## What changes
- `04-test/boundary-check/scan.mjs` is removed (not shipped, not kept).
- `04-test/boundary-check/boundary-check.md` becomes the definition: front matter with `provider: Foundation` and three typed tests (`copy` as `file-identity`, `implementation` as `token-sequence` with `window: 3`, `crypto` as `call-with-literal`), each with its `tests` edge (foundation/I1) and `ships: true`, followed by the record (status, who runs it, the tests, both axes, what it does not establish, where findings and decisions live). It holds no code, no regular expression, no target and no role.
- Requirements F34 to F37 and N20 to N22, Architecture A19 to A21 are reworded for a definition run by Engineering's Boundary Engine. Foundation specifies what to detect; the evidence shape and exit codes are the engine's.
- The installed `references/operations.md`, the skill, `05-src/AGENTS.md` and the root `AGENTS.md` Foundation section name the definition by the scoped package path and the engine command, and no longer name a Foundation scanner. `verify.json` is regenerated (the scanner is out, the definition is in).

## Reconciled, as the PLAN requires
- Script, shipped record, references, `verify.json` and build list: done above (the build copies the folder, so no build change).
- Cases: T54 to T59 and the imports half of T62 test the scanner and move to Engineering's engine Cases, each leaving a `moved:` line at the top of `boundary.test.mjs` (T54 to T6 and T15; T55 to T7; T56 to T3; T57 to T2; T58 to T4; T59 and T62's imports half to T5). Ids are not reused. T60 and T61 remain and now check the definition and the documents. T62 keeps its dependency half (no scanner shipped, library unchanged, no dependency). T63 becomes the well-formedness Case: the definition's references resolve to the shipped library and its three tests are typed. Foundation ships no YAML parser, so the Case reads the definition textually; full validation is the engine's.
- Acceptance evidence, before and after: the old scanner on the recorded fixture gave seven findings (6 files read, complete). The engine (Engineering DO, #1299, `claude/engineering-boundary-engine-do`) run on this package's built `dist/test/boundary-check/boundary-check.md` over the same fixture gives the same seven findings, the same files, rules and lines, 6 files read, complete. Only the id prefix differs by the provider name (`Foundation/...`; before `kaal-foundation/...`). The engine's own T15 pins the equivalence.
- Verified: `npm run test:publisher` 40 of 40 (was 46; the six moved Cases are Engineering's), `npm test` verified with every declared Case passing.

## Consequences and not done here
- The engine is in Engineering's collector (`kaal/engineering-boundary-engine`, #1299), not on `kaal/foundation`. Foundation's own tests depend on none of it (foundation/N2).
- Not changed: the tree DO (forest, `tests` edges on every Case, BEST suites, A25), the layering Change (Hosting is the bottom), the collector disposition. The `00-changes/boundary` source records are historic and stay.
- No promotion, version bump on main, SYNC, ledger entry, release dispatch or npm publication is authorized.
