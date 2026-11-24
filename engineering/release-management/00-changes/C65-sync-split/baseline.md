# C65 baseline

The baseline is `main` at c90b9fb (release/C58 and release/C60 promoted by #1863 and #1879; the sources of `verify Sync`, `approve Sync` and `review Sync` and their workflow source).

- `sync-review.yml` (source, not yet installed; its WIRE is #1885): the jobs `verify`, `approve` and `review` each check out the default branch, run `git fetch refs/pull/N/head:refs/kaal/pr` and then `node cli.mjs <command>`. `verify` has `contents: read`; `approve` and `review` have `contents: read` and `pull-requests: write`.
- `cli.mjs`: `verify`, `approve` and `review` each read the pull request through the API and judge it again from Git objects (`judgeNow`). `approve` approves only when the earlier verdict and the fresh one agree on the head, the base's tip, the parents and the merge tree.
- CodeQL on the WIRE #1885, read on 17 Nov 2026: `actions/untrusted-checkout` fires twice (the `approve` and `review` jobs, lines 92 and 130 of the installed copy).
- The experiment #1887 (closed, never merged) ran CodeQL on five minimal shapes: a job with a write token that fetches the candidate fires, also when it fetches by SHA; the same job with `permissions: {}` does not fire; a write job that never fetches does not fire.
- Rulesets, read through the API on 17 Nov 2026: bypass lists are empty; old integration (24952357) requires 1 approving review on `kaal/**` and no Code Owner review.
