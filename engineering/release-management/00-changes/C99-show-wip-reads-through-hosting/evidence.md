# C99 evidence

Observed on 19 November 2026 from a Claude Code cloud session, against `main` at 45245627.

- `node run.mjs Kai-Hacks-AI/KAAL show-wip.json settled` ended with status 2: `show WIP: gh api graphql failed 4 times: gh: GitHub GraphQL is not available from Claude Code sessions; use the REST API … (HTTP 403)`.
- `read.mjs` asks GraphQL in one place (`readOpenPulls`); every other read of the command is REST.
- `run.mjs` is the only file that starts `gh` (`execFileSync`).

Test Cases (drafts `T930–T932.red.mjs`, `helper.mjs` holds a stand-in `gh` that refuses GraphQL with the real message and answers REST from a canned repository), run against `main`:

- release/T930: RED (`the command did not print a report (… HTTP 403)`).
- release/T931: RED (`run.mjs starts a process itself`).
- release/T932: GREEN.

The REST routes the stand-in answers (`pulls`, `pulls/<n>`, `pulls/<n>/reviews`, `commits/<sha>/check-runs`, `commits/<sha>/status`) are the ones the DO is expected to use; the DO may adjust the stand-in to the routes it actually uses, and says so in its record.

## Review threads over REST (CPO review of #2066)

Probed 19 November 2026 from a cloud session:

- A review comment from `GET /repos/{owner}/{repo}/pulls/{n}/comments` has the keys `id`, `in_reply_to_id`, `pull_request_review_id`, `path`, `line`, `position`, `commit_id`, `body`, `user`, … and no `resolved`, `isResolved` or thread-state key. A thread's resolution is an action on the thread; a reply does not resolve it, and the comment list records no such action, so the state cannot be reconstructed from comments. Counting threads with no reply or by the last reply would be a guess.
- `GET /repos/Kai-Hacks-AI/KAAL/pulls/2025/ccr/review_threads` (the route the cloud session's own error message names) answered `[{"resolved":true,"outdated":true,"path":"engineering/release-management/05-src/hotfix/verify-hotfix.mjs","line":null,"comment_ids":[4628126271]}]` for a closed piece, and `[]` for #2066 and #2060. It carries what Show WIP needs: unresolved is `resolved === false`, the same set the GraphQL `isResolved` gave.
- Limits stated, not hidden: the route belongs to cloud sessions (a plain host answers 404, and there the fact is `not observed`); the answer's page size and a cut list are not documented, so the DO treats a full page as a gap, as `read.mjs` does for its cut lists today; the route is read-only here (the resolve and auto-merge routes are not used).
- Why not observed matters: Show WIP turns a piece whose `threads` is missing into `UNKNOWN`, so without the route every piece would read `not observed: threads`. That is the cost the route avoids.

Decision of the Owner (19 November 2026, after this evidence): environment-specific routes belong only inside Hosting; Show WIP asks for facts. The Cases T933 and T934 drafted for this are therefore Hosting's (kept as drafts for the `hosting/C111` PLAN: route answering gives the count, no route gives unknown) and are not in this Change.
