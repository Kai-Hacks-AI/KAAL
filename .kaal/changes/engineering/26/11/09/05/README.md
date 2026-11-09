# Engineering: one boundary engine, providers ship rules only (PLAN)

Capability: Engineering. Target: `kaal/engineering-boundary-engine`, cut from main 251e814 so that the contents of
`kaal/engineering` are left untouched and do not ride along (Owner, 2026-11-09). Record number is provisional until
integration. PLAN only: `engineering/boundary/PLAN.md`; no engine, no rules reader and no Case is built here.

Owner rulings of 2026-11-09 that it states: boundary tests exist in one place only (DRY); Engineering owns the one engine
and every package uses it; providers ship rules as Markdown with YAML front matter, parsed in Engineering only with the
repository's `yaml` package; targets are input; no role is named; a finding is audit.

It amends engineering/C10 (`engineering/boundaries/README.md`, PLAN, nothing built): "the Suite ships with the
provider's package as executable checks" becomes "the provider ships rules as data, and Engineering ships the one
engine". The amendment to that file is made by the DO, not here.

Consequences, each its own later Change: Foundation drops `scan.mjs` for a rules file (and T54 to T62 move to the engine's
Cases); Hosting's scan migrates to a rules file.

No promotion, version bump on main, SYNC, ledger entry, release dispatch or npm publication is authorized.
