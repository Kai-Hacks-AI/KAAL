# Engineering: Boundary Engine and capability-owned Boundary Tests (PLAN)

Capability: Engineering. Target: `kaal/engineering-boundary-engine`, cut from main 251e814 so that the contents of
`kaal/engineering` are left untouched and do not ride along (Owner, 2026-11-09). Record number is provisional until
integration. PLAN: `engineering/boundary/PLAN.md` and twelve RED Cases T1 to T12 in `engineering/boundary/boundary-engine.red.mjs`, all RED because the engine is not delivered, each asserting behavior. No engine and no definition reader is built here.

Owner rulings of 2026-11-09 that it states: boundary tests exist in one place only (DRY); Engineering owns the one engine
and every package uses it; Engineering owns the reusable Boundary Engine with typed detectors (file-identity, token-sequence, call-with-literal), each capability owns its own Boundary Tests as Markdown with YAML front matter, parsed in Engineering only with the
repository's `yaml` package; a new generic detector is an Engineering Change; targets are input; no role is named; a finding is audit.

It amends engineering/C10 (`engineering/boundaries/README.md`, PLAN, nothing built): "the Suite ships with the
provider's package as executable checks" becomes "the provider ships Boundary Test definitions as data, and Engineering ships the one
Boundary Engine". The amendment to that file is made by the DO, not here.

Consequences, each its own later Change: Foundation drops `scan.mjs` for a Boundary Test definition (and T54 to T62 move to the engine's
Cases); Hosting's scan migrates to a definition.

No promotion, version bump on main, SYNC, ledger entry, release dispatch or npm publication is authorized.

Embedding (incremental): Testing is embedded into KAAL Engineering but has not landed as a usable package, so Engineering offers a provisional, Engineering-owned execution adapter today, shaped to map onto Testing's Case later. Evidence completeness, finding disposition (a finding is an observation, not a defect) and the canonical test result are kept apart; no pass or fail is defined here, and Foundation 0.0.2 depends on no unlanded Testing.
