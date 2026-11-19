# C60 baseline

The baseline is the collector `kaal/release/sync-refusal`, branched from the tip 3c0b3b6 of the release/C58 collector `kaal/release/sync-review` (main 42e5b2a plus PLAN, DO and ACT of C58: the sources of `verify Sync`, `approve Sync` and `review Sync`, the workflow source and release/I32). C58 is not on `main` yet; only the promotion of this Change waits for it.

- `approve.mjs` decides `approve`, `would-approve` or `skip`. `cli.mjs approve` posts the approving review and lets any failure of that call throw, so it ends as exit 2 with the first line of `gh` output.
- GitHub refuses an approval by the workflow token with HTTP 422 and a message that GitHub Actions is not permitted to approve pull requests, when the repository setting "Allow GitHub Actions to create and approve pull requests" is off, or the organization blocks it. Other failures read differently: the head moved, the author approving their own pull request, a 403 for a missing permission.
- `review.mjs` acts only on a verdict that is FAIL, UNKNOWN or missing. A pure SYNC has a PASS verdict, so a refused approval leaves it with no label, comment or review request.
- The workflow's `review Sync` job needs `verify` only and runs beside `approve Sync`; it cannot know the outcome of the approval.
- The old integration ruleset (24952357) requires 1 approving review on `kaal/**` and no Code Owner review, read through the API on 17 Nov 2026. The integrating and collecting rulesets have no pull request rule.
