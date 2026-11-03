# Boundary account: `acme-lister` 0.4.0 (planned)

Account written by its owner before implementation. Nothing is built or installed yet.

## Boundaries

| # | Direction | Interaction | Contract owner and identifier | Obligation |
| --- | --- | --- | --- | --- |
| D1 | incoming | `list(archive)` API and `acme-lister` CLI | acme-lister/F1 | Accept an absolute path to a `.tgz`; refuse a relative path, a missing file and an archive in any other format with a named error and exit 2; print the archive's file names, one per line. |
| D2 | outgoing | reads the archive with Node `zlib` | Node `zlib` | Read the archive without extracting it to disk. |

## Test Plan (package-owned, planned)

| Case | Boundary | Exercises | Fixture / expectation |
| --- | --- | --- | --- |
| T1 | D1 | success: a 3-file `.tgz` | `fixtures/three.tgz`; expects three names in order |
| T2 | D1 | refusals: relative path, missing file | each exits 2 with the named error |
| T3 | D2 | working directory afterwards | expects directory listing unchanged |

## Evidence record

None yet. The owner intends to run `npm test` on Linux with Node 24 once built.
