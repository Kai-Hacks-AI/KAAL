# C111 baseline

The baseline is `main`.

- Hosting reads a Git revision (`readRevision`, hosting/C110) and runs commands (`execute`, `startPlan`). It holds no GitHub read.
- Show WIP (`engineering/release-management/05-src/show-wip`) starts `gh` through `execFileSync` and reads the open pull requests with one GraphQL query; in a Claude Code cloud session that query is refused (HTTP 403) and REST is answered. A cloud session also answers `GET /repos/{owner}/{repo}/pulls/{n}/ccr/review_threads`, which returns `resolved`, `outdated`, `path`, `line` and `comment_ids` per thread; plain REST has no thread state (release/C99 evidence).
- Other GitHub callers (the dispatcher, the collector scripts, Guard) are not touched here.
