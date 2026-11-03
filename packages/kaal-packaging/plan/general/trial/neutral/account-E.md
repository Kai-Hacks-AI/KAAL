# Boundary account: `acme-counter` 2.0.1

Account written by its owner.

## Boundaries

| # | Direction | Interaction | Contract owner and identifier | Obligation |
| --- | --- | --- | --- | --- |
| E1 | incoming | `count(dir)` API and `acme-counter` CLI | acme-counter/F1 | Accept an absolute directory path; refuse a relative path and a missing directory with a named error and exit 2; report the number of files. |
| E2 | outgoing | reads the directory tree | Node `fs` | Never write outside its scratch directory. |
| E3 | outgoing | `--cache <file>` stores the last count | acme-counter/F3 | Write the cache file to the path the caller names. |

## Test Plan (package-owned)

| Case | Boundary | Exercises | Fixture / expectation |
| --- | --- | --- | --- |
| T1 | E1 | success: a directory with 5 files | expects 5 |
| T2 | E1 | refusals: relative path, missing directory | each exits 2 with the named error |
| T3 | E2 | working directory afterwards | expects the directory listing unchanged |
| T4 | E3 | `--cache out.json` in the scratch directory | expects `out.json` to hold the count |

## Evidence record

Candidate: `acme-counter-2.0.1.tgz`, SHA-256 `a7c1…09fe`, packed once with npm 11.21.0. Installed into a fresh consumer on Node 24.22.1, Linux. Run: `npm test` → `acme-counter-verification {"result":"verified","exit":0,"cases":[T1..T4 pass]}`. The tarball digest in the run equals the release record's. Claim: the package meets its obligations on Linux with Node 24.22.1.
