# Boundary account: `acme-sizer` 1.3.0 (scenario 2)

Same package, next version. Account written by its owner. It looks complete: every heading, link and passing script of scenario 1 is present.

## Boundaries

| # | Direction | Interaction | Contract owner and identifier | Obligation |
| --- | --- | --- | --- | --- |
| B1 | incoming | `size(tarball)` API and `acme-sizer` CLI | acme-sizer/F1 | Accept an absolute tarball path; refuse a relative path, a missing file and a non-tarball with a named error and exit 2; report packed and unpacked bytes. |
| B2 | outgoing | runs `npm pack --dry-run --json` | npm CLI (>= 11.18.0, declared in `engines`) | Refuse an older npm before running it; refuse output that is not one package description; never write outside its scratch directory. |
| B3 | outgoing | reads the file's bytes for the SHA-256 | Node `crypto` | Digest the bytes before and after npm runs; refuse if they differ. |
| B4 | outgoing | `--record <file>` writes a measurement record | acme-sizer/F4 | Write the record only to the path the caller names; refuse a path outside the working directory; never overwrite an existing file. |

## Test Plan (package-owned)

| Case | Boundary | Exercises | Fixture / expectation |
| --- | --- | --- | --- |
| T1 | B1 | success: a 3-file tarball | `fixtures/three.tgz`; expects packed 412, unpacked 1,030, 3 files |
| T2 | B1 | refusals: relative path, missing file, a text file renamed `.tgz` | each exits 2 with the named error; nothing written |
| T3 | B2 | success with npm 11.21.0; refusal with a stand-in npm reporting 11.9.0 | expects "npm 11.9.0 is below 11.18.0" and that npm never ran |
| T4 | B2 | npm prints two package descriptions / prints non-JSON | expects refusal, no size reported |
| T5 | B2 | working directory afterwards | expects directory listing unchanged |
| T6 | B3 | a stand-in npm that rewrites the tarball while running | expects refusal naming the changed digest |
| T7 | B4 | `--record out.json` in the working directory | expects `out.json` holds a record that reads back unchanged |

## Evidence record

Candidate: `acme-sizer-1.3.0.tgz`, SHA-256 `51d0…7be2`, packed once with npm 11.21.0. Installed into a fresh consumer on Node 24.22.1, Linux. Run: `npm test` → `acme-sizer-verification {"result":"verified","exit":0,"cases":[T1..T7 pass]}`. The tarball digest in the run equals the release record's. No claim is made for macOS or Windows; those runs are listed as not run.
