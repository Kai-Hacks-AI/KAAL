# Engineering: Boundary Engine and capability-owned Boundary Tests (PLAN)

Status: PLAN (engineering, collector `kaal/engineering-boundary-engine`, cut from main). Ids are provisional until the collector integrates them. It authorizes no DO, promotion, version bump, SYNC, ledger entry, release dispatch or publication.

## Intent

Boundary checking has two parts that must not be mixed up.
- The **Boundary Engine** is reusable. Engineering owns it: discovery, loading, execution, target traversal, evidence and findings reporting, and the set of typed detectors.
- A **Boundary Test** is specific. The capability that owns a thing owns the tests that find it done elsewhere: what it owns, what must be detected elsewhere, the test's identity and its parameters. Engineering hard-codes no capability's boundary policy, and no capability ships its own scanner.
- Testing owns the generic Case, Suite and result semantics. The invoking KAAL repository supplies the targets. A finding is audit evidence; repository governance decides the consequences.

## Embedding: Testing and BEST (incremental)

Testing is embedded into KAAL Engineering, and each capability is engineered by KAAL Engineering. KAAL Testing has not landed on `main` as an independently usable package, so Engineering offers the usable execution approach today, with an explicit path to Testing-governed Case, Suite and result semantics and to BEST (Boundary, Engineering, Solution, Targets) later. Nothing here requires an unlanded Testing, and Foundation 0.0.2 does not depend on it.
- **The capability owns Boundary Tests and their edges.** Each test in a capability's definition names its identity, its parameters, and a `tests` edge to the Node it checks. It carries no `ships` flag: whether it ships is computed from its place in the capability's Architecture (engineering/case-graph/PLAN.md). Each is intended as a Boundary Case in suite B of BEST once Testing is embedded.
- **Engineering owns execution and evidence today.** The typed detectors, the definition loader, the walker and the evidence are Engineering's. The Case adapter (`engineering/boundary/cases.mjs`) is **provisional and Engineering-owned**: it runs now, directly from the definition, and is not claimed to be run by any BEST runner. It is not a permanent Boundary framework and defines no Case, Suite or result semantics.
- **Migration contract.** The adapter's descriptor (`id`, `suite`, `tests`, `run`) is shaped to map one-to-one onto Testing's Case. When Testing is embedded sufficiently, Testing governs Case, Suite, Plan, Run and result semantics (testing/F24 to F33), Engineering's runner discovers and runs the descriptors as suite B (and the per-target Runs of R6), the adapter shrinks to descriptors only, and the evidence below stays as it is. The result mapping is then Testing's and governance's to decide; it is not defined here.
- **Three things kept apart.** (1) *Evidence completeness*: the engine says whether it read everything it was given (`complete` or `unknown`) and reports findings and coverage. (2) *Finding disposition*: a finding is an observation, not a defect. The repository records a disposition against the finding id and line digest; the adapter only reports, from the recorded decisions the caller passes in, which findings are decided and which are not. It reads no decision record and judges nothing. (3) *Canonical test result*: Testing's, later. What consequences and release gates follow from a decided or undecided finding is repository governance's, and this PLAN states neither pass nor fail for it.
- The command line (`engine.mjs`) stays a low-level adapter for direct diagnostics and prints evidence only.

## Why (Owner rulings, 2026-11-09)

- Boundary tests exist in one place only (DRY). `scan.mjs` is a set of boundary tests run against a target; Hosting's scan is a second implementation of the same engine.
- A boundary Case says "this is what I do, so you should not do it", and checks others for doing a package's job.
- Engineering owns the engine, so every package can use it. Engineering is never a package, so no package depends on another at run time.
- Boundary Test definitions are collaborative: Markdown with YAML front matter, parsed with the repository's `yaml` package in Engineering only. Packages stay dependency-free; Engineering writes what a package needs (suite, ships) into its JSON manifest.
- Targets are input, and no role is named. A finding is audit; decisions live in the repository against finding id and line digest.

## What exists, and the conflict

`engineering/boundaries/README.md` (engineering/C10, PLAN, nothing built) says the provider owns its Boundary Test Suite and ships it as executable checks, and Engineering owns the Plan (a matrix of targets against Suites). Today that means Foundation's `scan.mjs` and Hosting's scan: two engines. This PLAN amends C10.

## Amendment to engineering/C10

Replace "the Suite ships with the provider's package as a reusable asset: executable checks, and review instructions" with: **the provider ships its Boundary Test definitions (and review instructions) as data; Engineering ships the one Boundary Engine that executes them through its typed detectors.** Unchanged: the provider owns the boundary definition and its tests; Engineering owns the applicability matrix, adds no test of its own and judges no finding; Testing owns Plan, Suite, Case and result semantics; Review owns judgments; the target capability corrects a finding.

## Requirements (provisional ids, numbered by the collector)

- **R1. One engine, with a path to Testing.** The engine library and its Case adapter (provisional and Engineering-owned, `engineering/boundary/cases.mjs`: `boundaryCases(definitionFiles)` returns Case descriptors that run today and map onto Testing's Case later) are the only boundary executor; `engine.mjs --tests <file>… --target <path>… [--base <dir>]` is a low-level adapter over the same library for direct diagnostics. It loads the definitions, walks the targets, runs every test, and reads only (no import of target code, no run, no write, no network, no process). It keeps no suite registry and defines no Case, Suite or result semantics.
- **R2. The Boundary Test execution contract.** A definition file is Markdown with YAML front matter: `provider` and a list of tests, each with `id`, `detector`, `looks-for` and that detector's typed parameters, plus prose (why, limits, "an empty list is no compliance"). Each test also has `tests` (the id of the Node it checks), which is the Case's `tests` edge. A definition never carries a `ships` flag; the engine refuses one. A definition names no target path and no role, and carries no code. The engine refuses a definition with an unknown detector, an unknown or missing parameter, a wrong parameter type, or a bound outside its limit. Detection is by Engineering's **typed detectors**, none of which takes a provider-supplied regular expression:
  - `file-identity`: `equals` (reference files beside the definition; the provider's own assets, not targets). Finds a scanned file whose SHA-256 (Foundation's `sha256`) equals one of them; the finding is on line 1. An unreadable reference makes the result `unknown`. (Foundation's `copy`.)
  - `token-sequence`: `tokens` (an ordered list of literal strings, matched case-insensitively) and `window` (a whole number, 0 to 10). The first token is on a line, and each next token is on that line or within `window` lines after the previous token's line. The finding is on the first token's line. (Foundation's `implementation`: `0x428a2f98`, `0x71374491`, `window: 3`.)
  - `call-with-literal`: `callee` (a list of names) and `literal` (a list of strings). Finds a call of a named function whose first argument is a quoted string equal to a listed literal, ignoring case and a hyphen; spaces inside the parentheses and single, double or backtick quotes are tolerated. (Foundation's `crypto`: callees `createHash`, `digest`; literals `sha256`, `sha-256`.)
  - **Deduplication.** A finding is a place (file and line), so a place is reported once. When several tests match one place, the finding is attributed to the first of them in the definition's order, which is the capability's own priority (Foundation's order: copy, implementation, crypto, as the old scanner). A test that matches nothing else reports nothing for that place.
  - **A new generic detector is an Engineering Change** (code, Cases and this list). A capability changes its own tests, their parameters and its definition file without any Engineering code change.
- **R3. The evidence.** One finding per place: `id` = `<provider>/<file>:<line>`, `rule` (the id of the attributed test), `file`, `line`, `digest` (the line's SHA-256 by Foundation's `sha256`, so a decision binds to the line as it was), `owner` (nearest `ownership.kaal.json`). Last stdout line `kaal-boundary-scan {json}` with `result` `complete` or `unknown` (the evidence's completeness, not a Case result) and the coverage. Exit 0 when complete (findings are not failures), 2 when unknown or on a usage error; never 1. A descriptor run through the adapter returns the evidence (`result`, `findings`, `coverage`) and a disposition (`decided` and `undecided` finding ids, from the decisions the caller passes in); it returns no pass or fail. Directories whose `ownership.kaal.json` names the provider are skipped and reported, because the owner holds the thing.
- **R4. Foundation owns its tests; it ships no scanner.** Foundation's three tests (`copy`, `implementation`, `crypto`) are one definition file in its Boundary folder (`04-test/boundary-check/boundary-check.md`, the record becomes the definition). Engineering's engine, run on it, reproduces the findings and coverage of the old scanner.
- **R5. Hosting's scan becomes a definition** for the same engine when Hosting migrates; until then it stays as it is and is listed as an open instance in the matrix.
- **R6. The matrix runs the engine.** Engineering's applicability matrix (C10) selects each provider's Boundary Tests and runs them once per applicable target, supplied by the invoking repository; the evidence is collected unchanged. It is written so that it can become a Testing Plan, with Runs of the same Suite per target and their own Test Data, when Testing is embedded.
- **R7. Conformance.** One Case pins the finding shape and exit codes by behavior (exactly the keys `id, rule, file, line, digest, owner`; the digest is the SHA-256 of the line; exit 0, 2, never 1; a usage error is 2). A comparison with Hosting's scan output on a shared fixture waits for Hosting's migration (R5); it is not claimed here.
- **R8. Engineering-only dependencies and no runtime edge.** The engine may import `yaml`; no package imports the engine or `yaml` for this, and no package depends on another for this. No statement is made about any consumer repository.

## Architecture

- Library (definition reader, detectors, walker, evidence), Case adapter and the low-level command live in `engineering/boundary/`, one file per detector. The matrix lives where C10 puts it. No permanent Boundary framework, suite registry, result authority or Case semantics is created here; the adapter is provisional (see Embedding).
- A package holds its Boundary Test definition and reference assets inside its Nodes' Boundary folder, as data, and `verify.json` lists them as shipped files.
- Foundation's replacement Change (below): remove `scan.mjs`, convert `boundary-check.md` into the definition, and move T54 to T62 (they test the scanner) to the engine's Cases in Engineering. T63 becomes a Case that the shipped definition is well-formed.
- The engine is in Engineering and Engineering is never a package, so there is no package-to-package edge.

## Testing (RED)

`engineering/boundary/boundary-engine.red.mjs` holds twelve Cases, all RED because `engine.mjs` is not delivered. Each asserts behavior through the engine as a process, so each fails on a missing engine and can pass only when the contract holds. T1 R1 `call-with-literal`: finds the call's line (id `demo/t/a.mjs:2`, exit 0). T2 R2 a definition that names a target or role, or has an unknown detector or parameter, is refused (exit 2). T3 R3 a missing target is `unknown`, exit 2, with the `kaal-boundary-scan` last line. T4 R3 an owned directory is skipped and reported. T5 R1/R8 read-only: the target tree is identical after a run, and `engine.mjs` imports only `node:` modules and `yaml`, with no write, spawn or network call. T6 R2/R4 discriminating: one definition with the three detectors over a fixture with a byte-identical copy and a one-byte non-copy, constants within the window and a near miss beyond it, a lone first constant, and crypto calls with spacing, quote and case variants and a near miss, and one line that matches two tests (attributed once, to the first in definition order); exact findings and coverage are asserted, plus the unreadable-reference case. T7 R7 shape and exit codes by behavior. T8 R2 capability-owned tests change without an Engineering change: with the engine's bytes unchanged (hash compared), a second definition from another provider, and the same definition with changed parameters, give different findings. T9 R2 a new detector needs an Engineering Change: a definition that names a detector the engine does not have, or carries a `script` or `regex` field, is refused and runs nothing. T10 R1/R2 the provisional adapter: `boundaryCases` returns one descriptor per test, with id `<provider>/<test id>`, suite `boundary`, and its `tests` edge and `ships` taken from the definition; a missing edge or flag is refused (T2). T11 R1/R3 evidence, disposition and no verdict kept apart: a run returns evidence (`complete` or `unknown`, findings, coverage) and a disposition (decided and undecided ids by finding id and line digest; a changed line is undecided again), and returns no pass, fail or verified. T12 R1/R2 no second framework: the adapter exports only `boundaryCases`, and a changed capability definition changes the descriptors and findings with the engine's and adapter's bytes unchanged. The DO proves the current Engineering execution and the migration contract (the descriptor shape), and requires no unavailable BEST implementation. It adds the matrix Cases (R6).

Acceptance evidence for the DO (R4): the engine, given Foundation's definition, must return the same findings and coverage as the current `scan.mjs` on one fixture. The old scanner, run from a `dist/` layout on a fixture of a real `sha256.mjs` copy, a one-byte non-copy, near and far constants and crypto lines, gave: `copy.mjs:1 copy`, `copy.mjs:6 implementation`, `crypto.mjs:2 crypto`, `crypto.mjs:4 crypto`, `impl-near.mjs:2 implementation`, `impl-same.mjs:1 implementation`, `noncopy.mjs:6 implementation` (6 files read, complete; `impl-far.mjs` and the lone constant on `impl-same.mjs:2` give none). The DO's equivalence Case reproduces this list.

## Replacement Change for C14 / #1293 (decided: Foundation 0.0.2 ships its Boundary Tests as data, no scanner)

The Owner decided that Foundation 0.0.2 ships rules only. This supersedes the C14 design merged in #1293, which shipped `scan.mjs`. Deleting the script is not enough; Foundation's follow-up Change is an explicit replacement Change that reconciles all of:
- the script (`scan.mjs` removed), the shipped record (becomes the definition), references to the script, `verify.json` and the build list;
- the Cases that test the scanner (T54 to T62 move to the engine's Cases; T63 becomes the definition-well-formedness Case);
- updated acceptance evidence, shown before and after: the engine run on Foundation's definition reproduces the findings `scan.mjs` gives today on the same fixtures (T6), so the capability to detect boundary violations is kept, not removed.

Responsibilities: Foundation owns what to detect (its Boundary Tests); Engineering owns how (loading, traversal, typed detectors, execution, reporting); the KAAL repository owns what findings mean (audit records, decisions, resulting Changes).

## Proof point honesty

The final proof point states separately what KAAL verifies (repository-only evidence: engine run on Foundation, Hosting and Guard, package checks both ways) and what is only planned. It claims no external consumer validation.

## Order

1. This PLAN, then its DO (the engine, the definition reader and the detectors) in Engineering.
2. Foundation's replacement Change: definition file replaces `scan.mjs`; tree DO follows. Engine DO and tree DO each get their own exact-head review.
3. Hosting migrates later.

## Open

- Decided by the Owner: 0.0.2 ships rules only.
- The DO, Foundation's follow-up Change and Hosting's migration are separate Changes with their own reviews.
