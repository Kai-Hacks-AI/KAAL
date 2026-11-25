# hosting/C111 DO record

## Delivered
`readPullRequests` (library) and the command `kaal-hosting-pulls`, in `05-src/skills/kaal-hosting/scripts/github/`: one small module per transport (`gh-graphql.ts`, `gh-rest.ts`, `cloud-threads.ts`), the one seam for the binary with the classification of a failure (`gh.ts`), the thin selection step (`pull-requests.ts`), the command layer (`pull-requests-command.ts`, `pull-requests-cli.mjs`), the exports and the `PULLS_UNREADABLE` code in `index.ts`, `tsconfig.json` and the build for the new folder, and Intent I19, Requirements F85–F89 and N13, Architecture A39, Skill, operation guide, Agent, engineering and README text, and the interface row in both interface tables.

## The CPO's ask at the PLAN review
A refusal (HTTP 403, 404 or 410, or "not available from Claude Code sessions") moves to the next transport, or makes the thread count unknown. A failure in transit (HTTP 5xx or 429, a rate limit, a timeout, no network) is repeated three times and then rejects with `PULLS_UNREADABLE`; so does any other failure. An outage is never read as a missing fact or a refusal (hosting/F87, hosting/T295).

## Test Case ids
The drafts T290–T294 became: T290–T293 and a new T295 and T296 in `04-test/package-check/pull-requests.test.mjs`, and T294 in `04-test/engineering-check/plan/pull-requests.test.mjs` (the placement, the modules, the interface row and the guidance; it was drafted as the build-and-bin Case and widened to the PLAN's A39). T295 (refused against transient) and T296 (the command's line and statuses) cover the review's ask and the command, which the PLAN had left to "one more Case". Ids T290–T296 are free on main and on every remote branch (checked 19 November 2026). Allocation is in `04-test/package-check/testing.md`. The Cases need no `gh`, network or Git: the seam is a fake.

## Differences from the PLAN's shape, stated
- A list GitHub cut (more than 20 latest reviews, 100 threads or 100 checks on one pull request) makes that fact unknown. The command did the same for reviews and checks; for threads it showed a lower bound when some were already open. Hosting does not invent a bound.
- Each check is one entry, its newest run, in three states, so a consumer need not read GitHub's own spelling.
- Pull requests are read six at a time over REST.

## Evidence
- `npm run test:publisher`: 207 tests, 199 pass, 5 fail. The same five fail on the unmodified collector (206 tests, 198 pass, 5 fail): hosting/T71 (`Cannot find package 'commonmark'`, the sibling validator is not installed here), hosting/T79, `Hosting release interoperability` and `verification cannot discard runner failures` (the installed dependency set in this sandbox differs from the manifest's), and their parent. T290–T296 pass.
- Linux only; not run on Windows or macOS.

## Not done
No npm publish, no pin moves, `.kaal/hosting` untouched. The consumer (release/C99) is its own Change.
