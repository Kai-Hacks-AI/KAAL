# Run Cases and report their outcomes: DO (testing/C64)

`testing/C64` is the DO of `testing/C63` (#2006, CPO approved, merged into the collector). The boundary stands: Testing runs Cases and reports observations; kaal-change judges a count; Guard enforces. The CPO's two acceptance gates for this DO are below, and this document says which one of them I have shown and where.

## What it delivers

- `lib/run.mjs` (`runCases`, `compareReports`, `reconstruct`), `lib/run-reporter.mjs` and `bin/kaal-testing.mjs`. `package.json` gains the export `./run`, the bin `kaal-testing`, and `bin` in `files`. No dependency is added: the runner uses Hosting (`executeSync`, `isolatedEnvironment`) and Node.
- The Cases testing/T363 to T369, renamed from `.red.mjs` to `.test.mjs` without a change of content, run from `test/plan/run-cases.test.mjs` and added to Testing's `npm test`. `run-red.mjs` is removed, since the wrapper replaces it.
- One test the PLAN did not plan, `test/run-termination.test.mjs` with `test/run-termination/blocked.fixture.mjs`: a file that blocks the event loop for good records its own process id, `runCases` stops it with a 3 s bound, and the test checks that the report has a `timeout` problem and that the recorded process is gone. It answers the CPO's second gate directly, on Hosting itself.

## The two acceptance gates

| Gate | Shown by | Status at this head |
| --- | --- | --- |
| Node 24: the reporter tells user tests, parents, suites and the file result apart, and rebuilds their relationships | T363 to T369 on CI's Node 24 (T369 also asserts the Node major, and records the exact `node --version` in every report's `execution.node`) | Shown on Node 22.23.4 in my sandbox for T363 to T368. T369 is GREEN there except its Node line, which is RED below Node 24 by design. **Node 24 is shown only by the CI run of this PR.** If CI shows a failure on Node 24, this DO stops and reports back, it does not guess |
| Hosting terminates a blocked child and no process survives | `test/run-termination.test.mjs` | Shown locally against a stub that has Hosting's documented `executeSync` signature (a child ended by `timeout` has `status: null`), because Hosting is not built in my sandbox. **Against Hosting itself it is shown only by CI** |

## What I found while doing it

A runner started from inside `node --test` (as the Cases' wrapper does) hands its `NODE_TEST_CONTEXT` on to the child, and the child then behaves as a worker of the outer run and reports nothing useful. `runCases` removes that variable from the child's environment. A file that produces no event at all is read with its exit status: exit 0 is `empty-inventory`, anything else is `file-failed` with the first line of its error. On a file stopped by the bound, the reporter output is partial, so the run reports only the `timeout` problem for it and keeps whatever tests were reported.

## What it does not claim

No Node 24 result of my own, and no Hosting result of my own: both are read from CI. Determinism is claimed only for Cases that do not depend on scheduling or shared mutable state. The captured streams in `streams/` are from Node 22.23.4. No promotion, activation, merge of a later delivery or publication is claimed.
