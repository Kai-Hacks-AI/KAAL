# Run Cases and report their outcomes: Testing

The planned Cases live in `packages/kaal-testing/test/plan/run-cases/`, named `T<n>.red.mjs`. Each exports `id`, `tests`, `title` and `run()`, with `lib.mjs` and 17 fixtures in `fixtures/`. They are immutable to DO. `testing/C64` renames them `.test.mjs`, adds a wrapper to Testing's `npm test` and runs them on Node 24. Each Case asserts that the runner exists before it imports it, so on main it is RED by assertion and never a load error.

| Case | Checks | What it decides deterministically |
| --- | --- | --- |
| testing/T363: counts leaf tests; suites, passing parents and the file-level result are not counted; a failing parent counts once | testing/F138 | green, red, mixed, nested, parent, deeper nesting (four levels, a three-level subtest chain) and concurrent fixtures |
| testing/T364: only an assertion is RED; skip, todo and cancellation are UNKNOWN; a file that does not end is stopped, reported as a timeout problem, and nothing unfinished is GREEN | testing/F139, testing/F142, testing/F145 | assertion against thrown error, skip and todo including failing ones, a parent with pending children cancelled, a hung file, a file that blocks the event loop (run is bounded, other files unaffected, bound recorded, default bound) |
| testing/T365: identity, duplicate names, Case attribution and conflicts | testing/F140, testing/F141 | id format and ordinals, duplicate-name, forms `ns/T<n>`, `T<n>`, `Tabc`, ancestor attribution, conflicting references give no Case |
| testing/T366: completeness and invalid input | testing/F142 | load error, crash, late error, empty file, one bad file among good ones, an unrecognised stream, seven kinds of invalid input, including a bound that is zero or not a number |
| testing/T367: comparison | testing/F143 | equal counts hiding a regression, added and removed, provisional on an incomplete or absent side, no verdict field |
| testing/T368: command line and retained streams | testing/F144, testing/F145 | exit 0 with RED, with problems and with a stopped file, `--timeout`, non-zero and no report for invalid input, `--streams` and reproduction from a stream |
| testing/T369: boundary, determinism and Node | testing/N30, testing/N31 | dependencies, one export, one bin, nothing written under root, same report twice in any input order, Node major 24 or later |

T369 asserts the Node major last, so it is RED on any Node below 24 even against a correct runner. That is the acceptance condition (testing/N31), not a defect of the Case. T364 cannot show that no process of a stopped file survives; that is a DO acceptance check on Hosting itself (testing/F145).

## RED evidence

`node packages/kaal-testing/test/plan/run-cases/run-red.mjs`: on main all seven are RED by assertion, 0 error, 0 green. `--green` with `KAAL_TESTING_IMPL` pointing at a reference runner checks the Cases can pass. See `evidence.md`.
