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

Release candidate: `acme-sizer-1.2.0.tgz`, SHA-256 `9f2c…a41e`, packed once with npm 11.21.0.

Claim: "All six Cases verify on the release candidate on Linux, macOS and Windows with Node 24."

Support offered: the CI run `acme-sizer #418` passed on all three hosts. The run's log shows `npm pack` writing `acme-sizer-1.2.1-rc.tgz` with SHA-256 `c8e4…0d17` and `node --version` printing v22.23.4 on the Linux job. The Windows job log is truncated after "Set up job". The macOS job ran `npm test` in the source workspace, whose `npm test` runs the source suite; the installed Embedded verification was not run on it. An earlier local run of the installed verifier on the release candidate (digest `9f2c…a41e`, Node 24.22.1, Linux) verified T1–T6.
