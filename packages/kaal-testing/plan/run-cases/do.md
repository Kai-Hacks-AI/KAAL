# Run Cases and report their outcomes: DO (testing/C64)

`testing/C64` is the DO of `testing/C63` (#2006, CPO approved, merged into the collector). The boundary stands: Testing runs Cases and reports observations; kaal-change judges a count; Guard enforces. The CPO's two acceptance gates for this DO are below, and this document says which one of them I have shown and where.

## What it delivers

- `lib/run.mjs` (`runCases`, `compareReports`, `reconstruct`), `lib/run-reporter.mjs` and `bin/kaal-testing.mjs`. `package.json` gains the export `./run`, the bin `kaal-testing`, and `bin` in `files`. No dependency is added: the runner uses Hosting (`executeSync`, `isolatedEnvironment`) and Node.
- The Cases testing/T363 to T369, renamed from `.red.mjs` to `.test.mjs` without a change of content, run from `test/plan/run-cases.test.mjs` and added to Testing's `npm test`. `run-red.mjs` is removed, since the wrapper replaces it.
- One test the PLAN did not plan, `test/run-termination.test.mjs` with `test/run-termination/blocked.fixture.mjs`: a file that blocks the event loop for good records its own process id, `runCases` stops it with a 3 s bound, and the test checks that the report has a `timeout` problem and that the recorded process is gone. It answers the CPO's second gate directly, on Hosting itself.

## The two acceptance gates

| Gate | Shown by | Status at this head |
| --- | --- | --- |
| Node 24: the reporter tells user tests, parents, suites and the file result apart, and rebuilds their relationships | T363 to T369 on CI's Node 24 (T369 also asserts the Node major, and records the exact `node --version` in every report's `execution.node`) | See "Node 24" below: the reconstruction held on Node v24.22.3 (CI) for every fixture, and the streams are kept in `streams/node-24.22.3-*.ndjson`. One planned Case assumed Node 22 behaviour and was corrected, with disclosure |
| Hosting terminates a blocked child and no process survives | `test/run-termination.test.mjs` | See "Hosting" below: it is read from CI, not from my sandbox (Hosting is not built there) |

## Node 24

CI ran the Cases on Node v24.22.3 and printed every fixture's reporter stream (kept in `streams/node-24.22.3-*.ndjson`, next to the Node 22 ones). Reconstruction from terminal events held: leaves, parents, suites and nesting up to four levels were rebuilt as planned, and T363, T365, T366, T367 and T369 (including the Node line) were GREEN on the first run. What differs from Node 22:
- Node 24 reports the file-level result only when it fails or the file is empty. For a file with passing tests there is no file event, where Node 22 reports one at the top as a passing parent. The runner reads both, since it recognises the file result structurally and never requires it.
- With a per-test timeout, Node 22 cancelled a later sibling of the timed-out test and Node 24 ran it (`after` is GREEN, the timed-out parent is `testTimeoutFailure`, its stuck child `cancelledByParent`).
That second difference exposed an assumption in one planned Case: T364 required the later sibling `after` to be UNKNOWN, which is Node 22 behaviour. I corrected that single assertion to "GREEN if it ran, UNKNOWN if it was cancelled, never RED", and said why in the Case. The CPO's gate (the reconstruction) did not fail, but the Case was wrong, so I name it here rather than leave it unmentioned. No other Case file changed.

## Hosting

First CI run: `executeSync`'s timeout ended the file after the bound, but its result was not `status: null` (node --test answers the signal and exits with its own code), so my detection by status missed it. The runner now treats a file as stopped when the status is null, a signal is set, or the clock reached the bound. The termination test then checks the recorded process is gone.

## What I found while doing it

Testing's own boundary (`test/boundary.test.mjs`) admits only `node:path` and `node:url` in delivered code, so the runner reads, writes and makes its scratch directory through Hosting (`kind`, `readFile`, `scratch`, `initialize`); `streamsDir` must therefore be missing or empty. Two assertions pinned the package before this Change and now list its additions: T160's export list (`./run`) and the pack list in `test/testing.test.mjs` (the bin and `lib/run*.mjs`).

A runner started from inside `node --test` (as the Cases' wrapper does) hands its `NODE_TEST_CONTEXT` on to the child, and the child then behaves as a worker of the outer run and reports nothing useful. `runCases` removes that variable from the child's environment. A file that produces no event at all is read with its exit status: exit 0 is `empty-inventory`, anything else is `file-failed` with the first line of its error. On a file stopped by the bound, the reporter output is partial, so the run reports only the `timeout` problem for it and keeps whatever tests were reported.

## What it does not claim

No Node 24 or Hosting result from my own sandbox: both are read from CI, as the table says. Determinism is claimed only for Cases that do not depend on scheduling or shared mutable state. The streams in `streams/` are from Node 22.23.4 and Node v24.22.3. No promotion, activation, merge of a later delivery or publication is claimed.
