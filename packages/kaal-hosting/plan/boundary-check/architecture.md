# Boundary Check Per Package: Architecture

Each element names, in brackets, the Requirements it answers.

- **hosting/A27** [hosting/F64, hosting/F65]: `bin/kaal-hosting-boundary.mjs` takes `--target` (repeatable). `src/boundary-core.ts` gains `scan({ targets, name })`, which reads each target through `read` and calls `couplings`. A file target is read as a one-file set. `boundary()` keeps its Test Cases for runners that gate. The command with `--target` calls `scan` and prints its result; `--root` maps to `scan` with a folder target and keeps the old behaviour of `boundary` only when `--name` and `--builtin` are given without `--target`.
- **hosting/A28** [hosting/F66, hosting/F68]: `couplings` groups its raw hits by file and line. Origin findings are the hits that bind a platform query or literal, or use one directly. A hit through an identifier bound earlier in the file is attached to the binding's finding as a reference. The binding is resolved from the declaration the scanner already tracks for `platform-query`, so no parser is added. The id, rules, kinds and references are derived there, once.
- **hosting/A29** [hosting/F67]: Hosting's own sources and tests are excluded by the caller not naming them as a target; `scan` itself never special-cases a package.
- **hosting/A30** [hosting/F70]: the skill is retired in one Change (`hosting/C101`) before the scan changes, so the removal and the new reading guidance are reviewed apart from code. `package.json` `files`, `bin` and exports lose the skill path; the README entry list and `plan/*` mentions are updated.
- **hosting/A31** [hosting/F71]: Hosting's two Test Plans are declared in files, not code: the Package Check is `test/verify.json`, and the Boundary Check is a short not-applicable declaration with its reason. Their shape is not decided here.

## Option considered for hosting/A27

| Option | What happens | Cost |
| --- | --- | --- |
| A. A new command for the scan | `kaal-hosting-scan --target …` beside `kaal-hosting-boundary`. | Two commands to keep and explain; breaks "one boundary tool". |
| **B. One command, two modes** (proposed) | `--target` is the scan; `--name/--root` is the gating run. | One more flag set to keep consistent. Experimental 0.0.x interface. |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `hosting/C100` PLAN: I15, F64–F71, N9, A27–A31; hosting/T114–T122 | Hosting | the Owner's rulings of 4 Nov |
| `hosting/C101` DO: retire the boundary skill, move reading guidance into the `kaal-hosting` skill (hosting/F70) | Hosting | C100; Architecture review |
| `hosting/C102` DO: `--target` scan, one finding per line, references (hosting/F64–F69) | Hosting | C100, C101 |
| `hosting/C103` DO: Hosting's two Test Plans (hosting/F71) | Hosting | C100; the shape from Packaging and Testing |
| Boundary Check Test Plan for every other package; decision records; `conform` completeness check | Packaging, Testing, each owner | C102, C103 |
| Ledger re-derive, freeze, SYNC, #1030 refresh | Engineering, Hosting | all Hosting Changes landed |
