# hosting/C111 evidence

Observed 19 November 2026 on Node 24 and Linux, on `main` 4479d007 plus this PLAN.

## Expected RED

Drafts `T290` to `T293` (`fixtures.mjs` holds the fake `gh`) copied into `04-test/package-check/` of a working tree and run with `node --test`: 4 of 4 fail, each with `readPullRequests is not exported`, the reason the PLAN states. `T294` fails because `dist/skills/kaal-hosting/scripts/github/pull-requests-cli.mjs` does not exist. The copies were removed; the PLAN adds no file outside this folder.

## What the facts rest on

- Show WIP's GraphQL query (release/C99 baseline) reads, per open pull request, the fields the `readPullRequests` record keeps: title, draft, head and base, merge state, auto-merge, the review threads (`isResolved`), the latest reviews and the check roll-up.
- In a cloud session `gh api graphql` answers HTTP 403 and REST answers; `GET /repos/{owner}/{repo}/pulls/{n}/ccr/review_threads` returns `resolved`, `outdated`, `path`, `line`, `comment_ids` per thread (probed on closed PR #2025, release/C99 evidence). Plain REST pull-request review comments carry no thread state.
- The fixtures in `fixtures.mjs` copy those shapes; the DO may adjust them to the exact routes it reads and says so in its record.

## Not yet shown

That each Case can pass on drafts of the Scripts: this PLAN carries the Cases and the shape, not the source. The DO writes the Scripts against these Cases.
