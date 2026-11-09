# Engineering: one boundary engine, providers ship rules only (PLAN, draft)

Status: PLAN (engineering, collector `kaal/engineering-boundary-engine`, cut from main). Ids are provisional until the collector integrates them. It authorizes no promotion, version bump, SYNC, ledger entry, release dispatch or publication.

## Why

The Owner's rulings of 2026-11-09:
- Boundary tests exist in one place only (DRY). `scan.mjs` is a set of boundary test cases: three rules run against a target. Hosting's scan is a second implementation of the same engine.
- A boundary Case says "this is what I do, so you should not do it", and checks others for doing a package's job.
- Engineering owns the engine, so every package can use it. Packaging (later) is embedded into Engineering. Engineering is never a package, so no package depends on another.
- Rules are collaborative, so they are Markdown with YAML front matter and are parsed with the repository's `yaml` package, in Engineering only. Packages stay dependency-free; Engineering writes what a package needs (suite, ships) into its JSON manifest.
- Targets are input and no role is named. A finding is audit (Engineering); decisions live in the repository against finding id and line digest.

## What exists, and the conflict

`engineering/boundaries/README.md` (engineering/C10, PLAN, nothing built) says the provider owns its Boundary Test Suite and ships it in its own package, and Engineering owns only the Plan (a matrix of targets against Suites). Today that means Foundation's `scan.mjs` and Hosting's scan: two engines. This PLAN amends C10.

## Amendment to engineering/C10

Replace "the Suite ships with the provider's package as a reusable asset: executable checks, and review instructions" with: **the provider ships its rules (and review instructions) as data; Engineering ships the one engine that runs them.** Unchanged: the provider owns the boundary definition and the rules; Engineering owns the applicability matrix, adds no rule of its own and judges no finding; Testing owns Plan, Suite, Case and result semantics; Review owns judgments; the target capability corrects a finding.

## Requirements (provisional ids, numbered by the collector)

- **R1. One engine.** `engineering/boundary/engine.mjs --rules <file>… --target <path>… [--base <dir>]` is the only boundary scanner. It walks the targets, applies every rule of the given rules files, and reads only (no import, no run, no write, no network, no process).
- **R2. Rules are data.** A rules file is Markdown with YAML front matter: a list of rules, each with `id`, `pattern`, `flags` and `looks-for`, plus prose (why the rule exists, its limits, "an empty list is no compliance"). A rules file names no target path and no role. A rule's pattern is matched per line.
- **R3. The result.** One finding per line and rule: `id` = `<provider>/<file>:<line>`, `rule`, `file`, `line`, `digest` (the line's SHA-256 by Foundation's `sha256`, so a decision binds to the line as it was), `owner` (nearest `ownership.kaal.json`). Last stdout line `kaal-boundary-scan {json}` with `result` `complete` or `unknown` and the coverage. Exit 0 when complete (findings are not failures), 2 when unknown or on a usage error; never 1. Directories whose `ownership.kaal.json` names the rules' provider are skipped and reported, because the owner holds the thing.
- **R4. Foundation's rules move out of `scan.mjs`.** Foundation's three rules (`copy`, `implementation`, `crypto`) are one rules file in the package (`04-test/boundary-check/boundary-check.md`, the record becomes the rules file). Foundation ships no scanner.
- **R5. Hosting's scan becomes a rules file** for the same engine when Hosting migrates; until then it stays as it is and is listed as an open instance in the matrix.
- **R6. The matrix runs the engine.** Engineering's applicability matrix (C10) calls the engine once per provider's rules file against each applicable target; the findings are collected unchanged.
- **R7. Conformance.** One Case pins the finding shape and exit codes, so an old instance (Hosting's scan) can be compared with the engine's output on the same fixture.
- **R8. Engineering-only dependencies.** The engine may import `yaml`; no package imports the engine or `yaml` for this.

## Architecture

- Engine, parser, walker and output live in `engineering/boundary/`. The matrix lives where C10 puts it.
- A package holds its rules file inside its Nodes' Boundary folder, as data, and `verify.json` lists it as a shipped file.
- Foundation's change (its own Change, after this): remove `scan.mjs`, convert `boundary-check.md` into the rules file, and move T54–T62 (they test the scanner) to the engine's Cases in Engineering. T63 becomes a Case that the shipped rules file is well-formed.
- No package-to-package edge: the engine is in Engineering, and Engineering is never a package.

## Testing (RED)

`engineering/boundary/boundary-engine.red.mjs` holds seven Cases, all RED because `engine.mjs` is not delivered (missing-deliverable evidence, not behavioural). T1 R1 finds the rule's line (id `demo/t/a.mjs:2`, rule, line, exit 0); T2 R2 refuses a rules file that names a target or a role; T3 R3 a missing target is `unknown`, exit 2, with the `kaal-boundary-scan` last line; T4 R3 an owned directory is skipped and reported; T5 R1 and R8 the engine only reads and imports only `node:` modules and `yaml`; T6 R4 Foundation's rules file gives the old scanner's findings; T7 R7 conformance with Hosting's scan. The DO turns them GREEN and adds the matrix Cases (R6).

## Order

1. This PLAN, then its DO (the engine and the rules reader) in Engineering.
2. Foundation's Change: rules file replaces `scan.mjs`; tree DO follows.
3. Hosting migrates later.

## Open

- Whether 0.0.2 ships the rules file only (this PLAN) or also keeps `scan.mjs` for one release. The PLAN says rules only.
- The DO, Foundation's follow-up Change and Hosting's migration are separate Changes with their own reviews.
