# release/C200: a failed gh read says why it failed

A HOTFIX. In `promotion-source/lib/run.mjs`, `gh()` throws `<path> cannot be read` for any non-zero exit and discards the error text. A rate-limit answer (`HTTP 403: API rate limit exceeded`) therefore read as a problem of the rules, and it blocked the promotion of release/C168 (#3005). Urgency: the next rate limit blocks the next promotion the same way, and nobody can tell from the check why. Driver: Operations' diagnosis of #3005. Under the interim convention, this is a hotfix because the promotion was blocked.

The Defect is release/D22. The correction keeps the exit status and the first line of the error text in the thrown message (LOUD). The prefix `<path> cannot be read` is unchanged. Nothing else moves: the answer is still UNKNOWN, no retry is added, and `.github` is not touched, so there is no WIRE.

Not in this Change: reading the rules once outside the wait loop (a separate Change in release) and a retry on a rate limit.
