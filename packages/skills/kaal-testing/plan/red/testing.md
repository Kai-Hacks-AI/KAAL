# RED Evidence and Accepted Regressions: Testing

The planned outer tests live in `packages/skills/kaal-testing/test/plan/red.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `testing/C5` turns them GREEN, adds them to Testing's `npm test`, and may add Code tests of its own.

| Test | Checks | Loop |
| --- | --- | --- |
| testing/T1: each leaf test's outcome is keyed by its identity, and suites are not Test Cases | testing/F1, testing/N2 | Requirements |
| testing/T2: a skipped or `todo` test is RED with its marker, a failing test without an identity is an Unidentified RED, and a duplicate identity is a finding | testing/F1 | Requirements |
| testing/T3: comparison with the base classes each RED as Feature, Regression or Persisting RED | testing/F2 | Requirements |
| testing/T4: a conforming acceptance record has no findings, and each missing or malformed member is refused under its own name | testing/F3 | Requirements |
| testing/T5: an acceptance applies only to its listed Regression REDs, on its branch, up to its expiry; an expired or stale acceptance applies to nothing and is reported | testing/F4 | Requirements |
| testing/T6: the development gate tolerates Feature REDs and accepted regressions; promotion blocks every Feature RED and unaccepted Regression RED; accepting one regression never unblocks another | testing/F6 | Requirements |
| testing/T7: the report lists every RED by identity and class, and an accepted regression carries its authority, branch and expiry and is counted RED, never GREEN | testing/F5 | Requirements |
| testing/T8: the same inputs give the same results, and `kaal-testing/red` imports no host module | testing/N1 | Architecture |

## RED evidence

At `testing/C4`, all eight tests are RED, and each is **blocked before behavioural assertion**, because kaal-testing exports no `./red`. They run with `node --test packages/skills/kaal-testing/test/plan/red.test.mjs`, outside Testing's `npm test` until `testing/C5`. This file is itself a test that is RED before its DO, so it runs normally, with no `todo` or `skip` marker.
