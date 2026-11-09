# Boundary account: `acme-sizer` 1.2.0 (scenario 3)

The boundaries and Test Plan are exactly those of scenario 1 (B1–B3, T1–T6). Only the evidence record differs. Account written by its owner.

## Evidence record

Release candidate: `acme-sizer-1.2.0.tgz`, SHA-256 `9f2c…a41e`, packed once with npm 11.21.0.

Claim: "All six Cases verify on the release candidate on Linux, macOS and Windows with Node 24."

Support offered: the CI run `acme-sizer #418` passed on all three hosts. The run's log shows `npm pack` writing `acme-sizer-1.2.1-rc.tgz` with SHA-256 `c8e4…0d17` and `node --version` printing v22.23.4 on the Linux job. The Windows job log is truncated after "Set up job". The macOS job ran `npm test` in the source workspace, whose `npm test` runs the source suite; the installed Embedded verification was not run on it. An earlier local run of the installed verifier on the release candidate (digest `9f2c…a41e`, Node 24.22.1, Linux) verified T1–T6.
