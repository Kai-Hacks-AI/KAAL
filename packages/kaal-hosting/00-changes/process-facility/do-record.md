# Process facility: DO record (hosting/C109)

Implements the approved plan (`plan.md`, #1097, CPO review 5793456282): `execute` and `executeSync` start `npm` and `npx` without `cmd.exe`, `startPlan`, `isolatedEnvironment` and `prepare`. Requirements hosting/F75–hosting/F79 and hosting/N11, intent hosting/I17, architecture hosting/A35–hosting/A37, Cases hosting/T206–hosting/T216 and hosting/T226.

## Where the DO differs from the plan, and why

1. **`env` is the child's whole environment, as given; it is not merged over `process.env`.** The plan said merged. The existing suite showed why that breaks the contract: callers that run a nested `node --test` remove `NODE_TEST_CONTEXT` from the environment they pass, and a merge puts it back (three Cases failed, with test-runner events in place of the command's output). `execute` has always used the environment it is given, so that is kept. A caller that wants variables set over its own composes them, and `isolatedEnvironment(dir, base)` already returns the composed environment. This also answers Guard's note that Hosting must not strip or add variables.
2. **`executeSync` throws the same error `execute` rejects with when a command cannot start** (the host's `ENOENT`), not a new `NOT_STARTED`, so the two are one contract and the shipped usage example that reads `error.code` is unchanged.
3. **`execute` now also resolves with `output`.** One shipped Case asserted the exact result shape; its expectation gains `output: "outerr"` and nothing else (`04-test/package-check/hosting.test.mjs`, "reports a failing command's status and output").

## Superseded or edited tests, before and after

| Where | Before | After |
| --- | --- | --- |
| `04-test/package-check/hosting.test.mjs`, "reports a failing command's status and output" | `{ status: 3, stdout: "out", stderr: "err" }` | the same plus `output: "outerr"` |
| `04-test/engineering-check/plan/release.test.mjs` (hosting/T24 to hosting/T31, hosting/T75) | each Case packs and runs `npm install` into its own consumer (13 installs) | unedited; `test:publisher` skips these nine by name. Successors hosting/T217 to hosting/T225 in `04-test/engineering-check/publisher/prepared-release.test.mjs` carry the same assertions on a copy of one prepared installation (one install). hosting/T22, hosting/T23, hosting/T48, hosting/T53 and hosting/T54 still run from the original file |

## Evidence

- RED then GREEN: `red-evidence.md`. `npm run test:publisher` locally (Linux, root): 201 pass, 2 skipped (hosting/T135 needs a non-root host, hosting/T208 needs a host with shims), 0 fail; the 14 release Cases pass.
- Cost, counted: the release suite runs one `npm install` (hosting/T213); `build` runs once for any number of copies (hosting/T211); no `cmd.exe` is involved in starting `npm` where the host has shims (hosting/T206, hosting/T207, hosting/T208).
- Cost, timed, local Linux (same machine, same Cases): release suite 63s before, 69s after. On Linux an install costs about what a copy of the installed tree costs, so no gain is expected here and none is claimed. - Cost, timed, Windows CI (`windows-latest`, Node 24.22.2), `test:publisher` Hosting job, same Cases, reported as measured:

| Step | Before (c761cc2, job 127579538999) | After (307444e, job 127610877040) |
| --- | --- | --- |
| Installed-package release suite | 14 Cases, 155.2s (`node --test` duration_ms 155155) | 9 successor Cases on one prepared installation, 85.1s (duration_ms 85119) |
| Remaining release Cases hosting/T22, T23, T48, T53, T54 | inside the 155.2s | 5 Cases, 4.3s (duration_ms 4278) |
| Together | 155.2s | 89.4s |
| Parallel part of `test:publisher` | 57.7s (193 pass, 2 skipped) | 58.2s (204 pass, 3 skipped) |

  The installed-package part is 66s (43%) shorter. The parallel part is unchanged within noise. All three hosts' Hosting, Guard and Acceptance jobs are green at the same head (3 Cases skipped in the parallel part on Windows, none failing).
