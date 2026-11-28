# C210 baseline

The baseline is `main` with hosting/C114 (grants, the reads), hosting/C117 and hosting/C169 (`postCheckRun`), and hosting/C174 (`postReview`) once it is promoted: this Change needs no C174 code, but its Case T363 posts a review, so it runs once C174 is on `main`.

- `AppAdapterError` has a `code` per operation and, since C117, an optional `status` and `headers` of GitHub's answer. Only `postCheckRun` and `postReview` set them. The reads (`READ_FAILED`) set neither, and a lost connection sets none.
- Nothing names the kind of a failure. A caller that wants to tell a rate limit from a refusal reads `retry-after` and `x-ratelimit-remaining` itself (`refusalOf` of hosting/C116 does it for the waiting reads only).
- Nothing classifies the outcome of a third-party check (a job's log, a check's output). The text of GitHub's Dependency Review ("not supported on this repository") is taken at its word wherever it is read.
- Release's `promotion-source` check prints raw error text as an interim (release/C200). Controls' C179 DO is provisional on a failure shape of its own, awaiting this one.
