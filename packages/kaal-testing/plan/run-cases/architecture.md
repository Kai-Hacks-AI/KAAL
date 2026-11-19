# Run Cases and report their outcomes: Architecture

Each element names, in brackets, the Requirements it answers.

- **testing/A49** [testing/F138, testing/F139, testing/F140, testing/F141, testing/F142, testing/F143, testing/F144, testing/N30, testing/N31]: Three files and one export, nothing else.
  - `lib/run.mjs` exports `runCases`, `compareReports` and `reconstruct(events, file)`. `runCases` validates input, then for each file (sorted) runs `node --test --test-reporter=<lib/run-reporter.mjs> --test-reporter-destination=<scratch file> <file>` through Hosting's `executeSync`, in Hosting's `isolatedEnvironment` of a scratch directory, with `--test-timeout` when `timeoutMs` is given. `reconstruct` is pure: it turns one file's events into tests and problems.
  - `lib/run-reporter.mjs` is a custom reporter that writes one JSON line per terminal event: type, name, nesting, line, column, testNumber, kind, skip, todo, failure type and code, and the first line of the message.
  - `bin/kaal-testing.mjs` is the command line. `package.json` gains `exports["./run"]`, `bin["kaal-testing"]` and `bin` in `files`.

## The assumption to prove: the tree from terminal events

Node reports a test only when it ends (children before parents, parent last). The runner rebuilds the tree from `nesting` and the order: events of nesting n+1 directly before an event of nesting n are its children. A leaf is an event with none. The file-level event is the last event at nesting 0, line 1, column 1, named after the file, and is treated as the file's own result: it fails for a load error, a crash or a late error, and passes for an empty file.

**Question for DO, answered on the accepted runtime:** on Node 24, can the reporter reliably tell user tests, test parents, suites and the synthetic file result apart, and reconstruct their relationships? Post-order reconstruction and the structural recognition of the file result are assumptions to validate, not facts. Reading only pass and fail is a preference: if it is not enough, the reporter may read other lifecycle events (`test:start`, `test:enqueue`, `test:dequeue`, `test:complete`). If Node 24 cannot support it reliably, DO stops and reports back instead of guessing. What Node 22.23.4 showed is in `evidence.md`, with the captured streams in `streams/`.

## Report

```
{ schema: "kaal-testing/run-report@1",
  counts: { GREEN, RED, UNKNOWN },
  tests: [{ id, file, path[], name, role: "leaf"|"parent", actual, reason?, detail?, case }],
  diagnostics: [{ kind: "duplicate-name"|"conflicting-case-reference", … }],
  execution: { complete, node, files[], problems: [{ file, kind, detail }] } }
```

## Open decisions (not decided here)

| Decision | State |
| --- | --- |
| Whole-run timeout | `--test-timeout` is a timer inside the test process and cannot stop a test that blocks the event loop, so no bound on the whole run is claimed. Hosting's `executeSync` has a `timeout` that ends the child; using it is possible without changing Hosting but is a decision for the Owner. Until then the limit is stated |
| Home of `compareReports` | Proposed: Testing, beside the report it compares, as a pure function. The alternative is `kaal-change`, which may depend only on foundation and hosting |

## Who owns what

| Concern | Owns |
| --- | --- |
| Testing (this Change) | running, observing, counting, comparing observations, the report shape |
| kaal-change | judging a count: PLAN same or up, DO same or down, ACT none RED (and none UNKNOWN) |
| Guard | running the registered check by its judgment adapter, never by the runner's exit code |
| Owner | what is enforced |
