# Run Cases and report their outcomes: Evidence

## RED of this PLAN

Baseline: `main` at `733d84b`. `node packages/kaal-testing/test/plan/run-cases/run-red.mjs`, Node 22.23.4, Linux: T363 to T369 are RED-observed, 0 error, 0 green. Each stops at "missing: lib/run.mjs (the runner is not delivered yet)".

## Can each Case pass, and fail for the right reason

Against a throwaway reference runner outside the repository (not part of this PLAN, and no design of the DO; Hosting replaced by a stub with the documented signatures of `executeSync` and `isolatedEnvironment`, because Hosting is not built in this sandbox): T363 to T368 GREEN. T369 passes its boundary, writing and determinism checks and then fails only at the Node line: this sandbox runs Node 22.23.4, so it cannot show Node 24. That is the open acceptance item.

Thirteen mutants (re-run after the CPO review added the whole-run bound and its fixture; one more is listed below) of the reference were each caught: any failure counted RED, skip not taking precedence, no ordinal, a conflicting reference ignored, always complete, never provisional, exit non-zero on RED, a failing parent dropped, a write under root, streams not kept, comparison by counts only, cancellation without a problem, and the file-level result counted. Each was caught by the Case that owns it (the last was caught through the empty-file Case of T366, because a non-empty file's result is a passing parent).

## What Node 22.23.4 showed (not Node 24)

Captured reporter streams of every fixture are kept in `streams/node-22.23.4-<fixture>.ndjson`, as the reporter wrote them, for investigation on Node 24.

- Children are reported before their parent, and the file's own result last, at nesting 0, line 1, column 1, named as the path given. For a non-empty file it contains the file's tests as children and so is a passing or failing parent; for an empty file, a load error or a crash it has no children and is the only event.
- A load error and a crash give no test events, only a failing file result, and tests after a crash are not reported. An error after tests keeps the earlier results and fails the file.
- A failing parent whose children failed carries `subtestsFailed`; one that failed on its own assertion does not. A failing todo is reported as a failure with `todo` set. A skip option on a failing test is reported with `skip` set.
- `cancelledByParent` appears when a test times out: the stuck test, its parent and later siblings are reported cancelled, and children that never started are not reported at all. A file that never ends (a stuck test with a live timer, no per-test timeout) only ends through the file's timeout, and tests after it are not reported.

Not shown: any of this on Node 24, behaviour with `--test-isolation`, and a test that blocks the event loop under a timeout.

## Open

- Node 24: every point above must be re-observed on the accepted runtime. If the tree cannot be reconstructed reliably from terminal events, the reporter may read other lifecycle events, and DO reports back if it cannot.
- Whole-run bound: shown with a stub that has the documented `executeSync` signature, not with Hosting. DO proves on Hosting, on Node 24, that a stopped child has `status: null` and that no process of its tree survives.

## After the CPO review

The review required a whole-run bound through Hosting's timeout and kept `compareReports` in Testing. Added: testing/F145, the fixture `block.fixture.mjs`, and checks in T364, T366 and T368. A new mutant (no bound passed to the child) is caught by T364.
