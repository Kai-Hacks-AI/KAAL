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
