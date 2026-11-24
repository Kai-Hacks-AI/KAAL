# C22 ACT: retrospective (4L)

Written by the agent that carried the Change.

## Liked

- The Change stayed one call deep: `check.mjs` lost its own Git handling and gained one `readRevision` call, with no new dependency and no change to the report. The accepted behaviour change (a symbolic link or submodule in the base is refused visibly) is one sentence in the PLAN and one Test Case.
- The numbers were measured before anything was promised: 1,070 Git starts and about 3.7 seconds against one call and about 0.11 seconds on this repository's `main`.
- Hosting's first consumer was a small, real one, so the function met a real caller before any larger migration depends on it.

## Learned

- Counting processes needs no shim: `GIT_TRACE` appends one line per Git process, works on every host, and is inherited by the child that Hosting starts. Test Case T386 compares 12 files with 24 instead of asserting a magic number.
- My first golden output for the regression Case T387 was written from what I expected, not from what the code printed, and was wrong; running the unchanged code once fixed it. A regression Case is recorded from the code as it is.
- The DO's CI builds Hosting from the collector's tree. A collector cut from `main` before `hosting/C110` was promoted could not build the DO, so a SYNC of `main` into the collector had to come first. The PLAN stated the order (promotion first); the SYNC step was not named.

## Lacked

- Case and Change ids across Engineering: `C22` already names a Change in release-management, and the T-numbers are scanned by hand over every remote branch. The ids were free when checked, but only because I looked everywhere.
- A local run on Windows and macOS; CI covers them. The scratch fixtures use no host-specific path or index entry (the symbolic link goes in by object, not by file).

## Longed For

- The other revision readers (the seven the Hosting assessment found) moving to `readRevision` one by one, each its own Change.
- One place that allocates Case ids so a PLAN's ids are final when it merges.

## Follow-ups

- The PROMOTION of this Change to `main` is next; nothing is published, no pin moves, and the check stays report-only with no ruleset, workflow or hook using it.
- Further consumers and a GitHub transport entry in Hosting remain later options; none is started.
