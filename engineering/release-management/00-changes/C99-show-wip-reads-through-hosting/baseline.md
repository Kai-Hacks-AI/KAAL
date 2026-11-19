# C99 baseline

The baseline is `main`.

- `05-src/show-wip/run.mjs` imports `node:child_process` and runs `gh api` through `execFileSync`, retrying a gateway failure up to four times.
- `read.mjs` reads every open piece with one GraphQL query (`gh api graphql`): title, draft, branches, merge state, auto-merge, review threads, latest reviews and the check roll-up. The branch, tag and package reads are already REST.
- Hosting holds no GitHub read entry. Git reads are in Hosting (`readRevision`, hosting/C110); GitHub transport is not.
- In a Claude Code cloud session `gh api graphql` fails with HTTP 403 and the REST API works.
