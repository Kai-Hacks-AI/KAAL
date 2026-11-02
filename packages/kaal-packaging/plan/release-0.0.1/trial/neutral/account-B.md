# Boundary account: `acme-sizer` 1.2.0 

A small npm package that reports an npm tarball's delivered size. Account written by its owner.

## Boundaries

| # | Direction | Interaction | Contract owner and identifier | Obligation |
| --- | --- | --- | --- | --- |
| B1 | incoming | `size(tarball)` API and `acme-sizer` CLI | acme-sizer/F1 | Accept an absolute tarball path; refuse a relative path, a missing file and a non-tarball with a named error and exit 2; report packed and unpacked bytes. |
| B2 | outgoing | runs `npm pack --dry-run --json` | npm CLI (>= 11.18.0, declared in `engines`) | Refuse an older npm before running it; refuse output that is not one package description; never write outside its scratch directory. |
| B3 | outgoing | reads the file's bytes for the SHA-256 | Node `crypto` | Digest the bytes before and after npm runs; refuse if they differ. |

## Test Plan (package-owned)

| Case | Boundary | Exercises | Fixture / expectation |
| --- | --- | --- | --- |
| T1 | B1 | success: a 3-file tarball | `fixtures/three.tgz`; expects packed 412, unpacked 1,030, 3 files |
| T2 | B1 | refusals: relative path, missing file, a text file renamed `.tgz` | each exits 2 with the named error; nothing written |
| T3 | B2 | success with npm 11.21.0; refusal with a stand-in npm reporting 11.9.0 | stand-in npm is a Node script; expects "npm 11.9.0 is below 11.18.0" and that npm never ran |
| T4 | B2 | npm prints two package descriptions / prints non-JSON | expects refusal, no size reported |
| T5 | B2 | working directory afterwards | expects directory listing unchanged |
| T6 | B3 | a stand-in npm that rewrites the tarball while running | expects refusal naming the changed digest |

## Evidence record

Candidate: `acme-sizer-1.2.0.tgz`, SHA-256 `9f2c…a41e`, packed once with npm 11.21.0. Installed into a fresh consumer on Node 24.22.1, Linux. Run: `npm test` → `acme-sizer-verification {"result":"verified","exit":0,"cases":[T1..T6 pass]}`. The same tarball digest is recorded in the run and in the release record. No claim is made for macOS or Windows; those runs are listed as not run.
