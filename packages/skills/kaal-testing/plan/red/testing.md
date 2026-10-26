# RED Evidence and Feature-Accepted Regressions: Testing

The planned outer tests live in `packages/skills/kaal-testing/test/plan/red.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `testing/C5` turns them GREEN, adds them to Testing's `npm test`, and may add Code tests of its own.

The fixtures are small `node:test` files, written into a fresh directory and observed through `kaal-testing/observe`. Nothing here uses a real capability's tests.

| Test | Checks | Loop |
| --- | --- | --- |
| testing/T1: observe records each given file by its bytes or as absent, and each test it ran with its file, suite path and outcome | testing/F1 | Requirements |
| testing/T2: suites are not Test Cases; a skipped or `todo` test is RED with its marker; a failing test without an identity is an Unidentified RED; a duplicate identity is a finding | testing/F2 | Requirements |
| testing/T3: Regression, Persisting and Feature REDs, new GREEN, and a Missing RED for an established Test Case that disappeared | testing/F3 | Requirements |
| testing/T4: unknown evidence is never read as absent or new | testing/F3 | Requirements |
| testing/T5: a decided FAR entry names its Change and its Test Cases; each malformed member is a finding and accepts nothing | testing/F4 | Requirements |
| testing/T6: an accepted entry marks only its listed Regression or Missing REDs, under its Change, and they stay RED; any other listed identity is stale | testing/F5 | Requirements |
| testing/T7: evaluation follows the gate's policy; acceptance subtracts single identities; findings always block, a candidate file that did not run to the end among them; a malformed policy fails closed | testing/F10 | Requirements |
| testing/T8: the report lists every RED by identity, class and file; an accepted RED carries its Change and is counted RED, never GREEN | testing/F6 | Requirements |
| testing/T14: the same observed runs, FAR outcome and policy give the same results | testing/N1 | Requirements |
| testing/T15: `kaal-testing/red` reads runs only through Testing's own observation, and imports no host module | testing/N4 | Architecture |

Each title's first bracket is its trace target under TEST A FINDING (`testing/C6`). Where a title lists a second target, it is there to state the Intent or Nonfunctional the test guards (testing/T4 guards `testing/I2` and `testing/N4`; testing/T15 guards `testing/N1`).

## RED evidence

At `testing/C4`, all ten tests are RED. Each is **blocked before behavioural assertion**, because kaal-testing exports neither `./observe` nor `./red`.

The tests run with `npm run build -w kaal-hosting && node --test packages/skills/kaal-testing/test/plan/red.test.mjs`, outside Testing's `npm test` until `testing/C5`. The file is itself a set of tests that are RED before their DO, so it runs normally, with no `todo` or `skip` marker.
