# Boundary account: `acme-hasher` 1.0.0

Account written by its owner.

## Claim

This release is claimed for Linux with Node 24.22.1 only. macOS and Windows are not claimed and have not been run.

## Boundaries

| # | Direction | Interaction | Contract owner and identifier | Obligation |
| --- | --- | --- | --- | --- |
| F1 | incoming | `hash(file)` API and `acme-hasher` CLI | acme-hasher/F1 | Accept an absolute file path; refuse a relative path, a missing file and a directory with a named error and exit 2; print the SHA-256. |
| F2 | outgoing | reads the file's bytes | Node `fs` and `crypto` | Read the file once; refuse if its size changes while it is read. |

## Test Plan (package-owned)

| Case | Boundary | Exercises | Fixture / expectation |
| --- | --- | --- | --- |
| T1 | F1 | success: `fixtures/abc.txt` | expects the known SHA-256 of `abc` |
| T2 | F1 | refusals: relative path, missing file, a directory | each exits 2 with the named error and prints no digest |
| T3 | F2 | a stand-in `fs` that grows the file during the read | expects refusal naming the size change |
| T4 | F2 | a read that fails midway | expects refusal and no partial digest |

## Evidence record

Candidate: `acme-hasher-1.0.0.tgz`, SHA-256 `3be9…c014`, packed once with npm 11.21.0. Installed into a fresh consumer on Node 24.22.1, Linux. Run: `npm test` → `acme-hasher-verification {"result":"verified","exit":0,"cases":[T1..T4 pass]}`. The tarball digest in the run equals the release record's. macOS and Windows: not run, not claimed.
