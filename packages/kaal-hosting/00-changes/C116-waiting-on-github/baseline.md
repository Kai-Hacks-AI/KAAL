# C116 baseline

The baseline is `main` with the C115 visible text. C114 (the App adapter) is on its collector and not yet on `main`.

- Hosting's own reads (`gh-rest.ts`, `gh-graphql.ts`, the C114 reads) fail once and name the failure; none retries and none says whether a failure was GitHub refusing the read or the read being wrong.
- Release's C164 holds the only waiting code, in a script: `schedule(n)`, a refusal test written as a regular expression over `gh`'s text (any 403 counts as refused), and a retry loop that waits 20 s doubling to 120 s or the `Retry-After` text. Its Cases (release/T1601, release/T1602) pin them there.
- Nothing logs the rate limit.
