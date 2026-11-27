# hosting/C113 DO record

## Delivered
- `scripts/github/templates.ts`: the declaration validator, `renderTemplate`, `renderBody`, `checkTemplates` and `PullRequestError`.
- `scripts/github/raise.ts`: `raisePullRequest`, with the policy locations, the revision-bound comparison, the owners' rules, the write-area boundary and the two steps.
- `scripts/pull-request-cli.mjs`, declared as the bin `kaal-hosting-pull-request` and copied by the build.
- Re-exports from `index.ts`; Intent I21, Requirements F93–F97, Architecture A41 and A42 with the interface row (in `03-architecture` and in `00-changes/interface`); the operation guide rows; the README entry list; the allocation in `04-test/package-check/testing.md`.

## Test Case ids
The drafts T303–T317 became `04-test/package-check/pull-request-templates.test.mjs` (T303–T309), `pull-request-raise.test.mjs` (T310–T317) and `pull-request-fixtures.mjs`, with their bodies and assertions unchanged. Two things changed in how they run, not in what they claim: the imports are merged per file and point at `./pull-request-fixtures.mjs`, and T316 starts the command asynchronously (a synchronous start blocked the process that serves its stand-in for the API, so it could never answer). The drafts and `fixtures.mjs` are removed from this folder. Ids T303–T317 are free on main and every remote branch (checked 26 November 2026).

## Reconciled to the merged PLAN amendment

The CPO's review of this DO found two gaps in revision-bound authority; the PLAN amendment (T327 and T328, merged in the collector) added the Cases, and this DO implements exactly them. The drafts T327 and T328 became the delivered Cases in `pull-request-raise.test.mjs`, with assertions unchanged from the amendment's drafts; only the fixture stand-in gained what they need (a compare entry may be an object with `previous_filename`, and the opened pull request names its base revision). F97 states both. T303 to T317 are unchanged.

## Evidence
- T327 and T328 pass, and both fail on the DO before the amendment.
- T303–T317: 15 of 15 pass, each of the drafted RED Cases now GREEN.
- `hosting/T41` (the packed package exposes exactly the interface its Architecture declares) and its eight sub-cases pass with the new bin declared in both interface tables.
- `npm run test:publisher`: the same 5 failures as on the unmodified collector (hosting/T71, T79, `Hosting release interoperability`, `verification cannot discard runner failures` and a parent); `prepared-release.test.mjs` fails the same 4 Cases (T219, T221, T222, T224) before and after; `usage-mutations.mjs` fails on the unmodified collector too; the defect and affected mutation steps and the release Cases pass.
- Linux only; not run on Windows or macOS (CI runs both).

## Not done
- Writing or installing any template (a WIRE, Kai's go): Hosting only renders and checks.
- The owners' declarations (Change, Release) and the policy files of Engineering (C36, C37) at the paths the generator reads: until they exist, `raisePullRequest` refuses every raise (unknown refuses). That is the PLAN's design, not a defect.
- SYNC, PROMOTION and WIRE by the agent path, and delegated areas: refused, fail closed (the CPO's note on the PLAN: resolve before general adoption).
- No npm publish, no pin moves, `.kaal/hosting` untouched.
