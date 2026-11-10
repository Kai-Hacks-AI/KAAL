# track Work

`track Work` (release-management/C7) says what to work on next, from one script that both roles ask: `node engineering/release-management/05-src/track-work/run.mjs --role cto|cpo`. The role is required.

Work is a Change's commits at a station (`12-collectors`, `11-main`, `10-npmjs`, read from the pull request's base), opened or not. Each piece is **about to open** (CTO: a branch with no pull request, a collector ahead of `main` with no promotion pull request, `main` ahead of the last Release), **in stock** (CTO: CI red or pending, behind its base, unresolved conversations, a failing Envelope verdict, or approved with auto-merge off) or **about to close** (CPO: reviewable, no approval at the head). Approved at the head with auto-merge on is `queued` and nobody's.

It judges nothing and writes nothing. The Envelope is the verdict of the `verify Envelope` check, read as a fact; no verdict is `unknown (provisional)`. What could not be read is printed as `incomplete:` lines, so a short list is never mistaken for a complete one.

`track-work.mjs` is the pure sorting (`trackWork`, `fromGraphql`, `render`), `gather.mjs` reads through an injected `gh`, `run.mjs` is the entry. Cases: `track-work.test.mjs` (T38 to T43) and `gather.test.mjs` (T44).
