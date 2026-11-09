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
- **R2. Rules are data, with three declarative kinds.** A rules file is Markdown with YAML front matter: `provider` and a list of rules, each with `id`, `kind`, `looks-for` and the kind's fields, plus prose (why the rule exists, its limits, "an empty list is no compliance"). A rules file names no target path and no role. A rule's regular expressions take `flags` (for example `i`). The engine ships one evaluator per kind, and an unknown kind is refused:
  - `kind: line`: `patterns` (a list). A finding on every line where any pattern matches. (Foundation's `crypto`.)
  - `kind: sequence`: `steps` (an ordered list of patterns) and `within` (a whole number, at most 10). Step 1 matches on a line; each next step matches on that same line or on one of the following `within` lines. The finding is on the line of step 1. (Foundation's `implementation`: `0x428a2f98`, then `0x71374491`, `within: 3`.) The window is bounded, so the evaluator stays line-based and cheap.
  - `kind: file-bytes`: `equals` (a list of reference files, paths relative to the rules file). A finding on line 1 of every scanned file whose SHA-256 (Foundation's `sha256`) equals that of a reference file. The reference files are the provider's own shipped assets beside its rules, not targets, so this names no target. If a reference file cannot be read, the result is `unknown`. (Foundation's `copy`: `sha256.mjs`, `sha256.d.ts`.)
  - One finding per line and rule, as before; when two rules hit one line, the first rule in the rules file wins (the old scanner's behavior: copy, then implementation, then crypto).
- **R3. The result.** One finding per line and rule: `id` = `<provider>/<file>:<line>`, `rule`, `file`, `line`, `digest` (the line's SHA-256 by Foundation's `sha256`, so a decision binds to the line as it was), `owner` (nearest `ownership.kaal.json`). Last stdout line `kaal-boundary-scan {json}` with `result` `complete` or `unknown` and the coverage. Exit 0 when complete (findings are not failures), 2 when unknown or on a usage error; never 1. Directories whose `ownership.kaal.json` names the rules' provider are skipped and reported, because the owner holds the thing.
- **R4. Foundation's rules move out of `scan.mjs`.** Foundation's three rules (`copy`, `implementation`, `crypto`) are one rules file in the package (`04-test/boundary-check/boundary-check.md`, the record becomes the rules file). Foundation ships no scanner.
- **R5. Hosting's scan becomes a rules file** for the same engine when Hosting migrates; until then it stays as it is and is listed as an open instance in the matrix.
- **R6. The matrix runs the engine.** Engineering's applicability matrix (C10) calls the engine once per provider's rules file against each applicable target; the findings are collected unchanged.
- **R7. Conformance.** One Case pins the finding shape and exit codes by behavior (exactly the keys `id, rule, file, line, digest, owner`; the digest is the SHA-256 of the line; exit 0, 2, never 1; a usage error is 2). Comparing Hosting's scan output on a shared fixture waits for Hosting's migration (R5), because Hosting's scan is TypeScript source with its own shape; it is not claimed here.
- **R8. Engineering-only dependencies.** The engine may import `yaml`; no package imports the engine or `yaml` for this.

## Architecture

- Engine, parser, walker and output live in `engineering/boundary/`. The matrix lives where C10 puts it.
- A package holds its rules file inside its Nodes' Boundary folder, as data, and `verify.json` lists it as a shipped file.
- Foundation's change (its own Change, after this): remove `scan.mjs`, convert `boundary-check.md` into the rules file, and move T54–T62 (they test the scanner) to the engine's Cases in Engineering. T63 becomes a Case that the shipped rules file is well-formed.
- No package-to-package edge: the engine is in Engineering, and Engineering is never a package.

## Testing (RED)

`engineering/boundary/boundary-engine.red.mjs` holds seven Cases, all RED because `engine.mjs` is not delivered. Each asserts behavior through the engine as a process, so each fails on a missing engine and can pass only when the contract holds. T1 R1 `line` rule: finds the line (id `demo/t/a.mjs:2`, exit 0). T2 R2 a rules file naming a target or role, or an unknown kind, is refused (exit 2). T3 R3 a missing target is `unknown`, exit 2, with the `kaal-boundary-scan` last line. T4 R3 an owned directory is skipped and reported. T5 R1/R8 read-only: the target tree is byte- and listing-identical after a run, and `engine.mjs` imports only `node:` modules and `yaml`, with no write, spawn or network call in it. T6 R2/R4 discriminating: one rules file with the three kinds (`file-bytes`, `sequence`, `line`) over a fixture with a byte-identical copy and a one-byte-changed non-copy, constants within the window and a near miss beyond it, a first constant alone, and a crypto line; the exact findings and coverage are asserted. T7 R7 shape and exit codes by behavior. The DO turns them GREEN and adds the matrix Cases (R6).

Acceptance evidence for the DO (R4): the engine, given Foundation's rules file, must return the same findings and coverage as the current `scan.mjs` on one fixture. The old scanner, run from a `dist/` layout on a fixture of a real `sha256.mjs` copy, a one-byte non-copy, near and far constants and crypto lines, gave: `copy.mjs:1 copy`, `copy.mjs:6 implementation`, `crypto.mjs:2 crypto`, `crypto.mjs:4 crypto`, `impl-near.mjs:2 implementation`, `impl-same.mjs:1 implementation`, `noncopy.mjs:6 implementation` (6 files read, complete; `impl-far.mjs` and the lone constant on `impl-same.mjs:2` give none). The DO's equivalence Case reproduces this list.

## Replacement Change for C14 / #1293 (decided: rules only in 0.0.2)

The Owner decided that Foundation 0.0.2 ships rules only. This supersedes the C14 design merged in #1293, which shipped `scan.mjs`. Deleting the script is not enough; Foundation's follow-up Change is an explicit replacement Change that reconciles all of:
- the script (`scan.mjs` removed), the shipped record (becomes the rules file), references to the script, `verify.json` and the build list;
- the Cases that test the scanner (T54 to T62 move to the engine's Cases; T63 becomes the rules-well-formedness Case);
- updated acceptance evidence, shown before and after: the engine run on Foundation's rules file reproduces the findings `scan.mjs` gives today on the same fixtures (T6), so the capability to detect boundary violations is kept, not removed.

Responsibilities: Foundation owns what to detect (rules); Engineering owns how (parsing, traversal, execution, reporting); the KAAL repository owns what findings mean (audit records, decisions, resulting Changes).

## Proof point honesty

The final proof point states separately what KAAL verifies (repository-only evidence: engine run on Foundation, Hosting and Guard, package checks both ways) and what is only planned. It claims no external consumer validation.

## Order

1. This PLAN, then its DO (the engine and the rules reader) in Engineering.
2. Foundation's replacement Change: rules file replaces `scan.mjs`; tree DO follows. Engine DO and tree DO each get their own exact-head review.
3. Hosting migrates later.

## Open

- Decided by the Owner: 0.0.2 ships rules only.
- The DO, Foundation's follow-up Change and Hosting's migration are separate Changes with their own reviews.
