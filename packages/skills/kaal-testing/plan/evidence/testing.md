# Contract Evidence from Observed Runs: Testing

The planned outer tests live in `packages/skills/kaal-testing/test/plan/evidence.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `testing/C8` turns them GREEN, adds them to Testing's `npm test`, and may add Code tests of its own.

| Test | Checks | Loop |
| --- | --- | --- |
| testing/T9: `accept` lists each test it ran, with its file, the file's bytes as run, its suite path and its outcome | testing/F7, testing/A5 | Requirements |
| testing/T10: a statement whose offered tests passed in the run is `observed`, and its inference is still a judgment; a statement with a failed test is a `verified failure` | testing/F8 | Requirements |
| testing/T11: a copied run, a test the run did not execute, and bytes other than those run stay `unknown`, each with its reason | testing/F8, testing/I5 | Requirements |
| testing/T12: a scenario that installed nothing, or a run whose provenance failed, gives no evidence even when its test passed | testing/F9 | Requirements |
| testing/T13: kaal-testing's runtime depends on `c8` and Hosting only, and nothing it delivers imports a package it judges | testing/N3, testing/A6 | Architecture |

The fixtures are a one-file package, packed once, and scenarios written into a fresh directory that serves as the repository root. Nothing here uses a real capability's mapping. Core's mapping is Core's, once `testing/C8` exists.

## RED evidence

The tests run with `npm run build -w kaal-core -w kaal-hosting && node --test packages/skills/kaal-testing/test/plan/evidence.test.mjs`, outside Testing's `npm test` until `testing/C8`. At `testing/C7`:

- **testing/T9 to testing/T12 are RED, blocked before behavioural assertion.** `accept`'s result has no per-test outcomes (`result.tests`).
- **testing/T13 is GREEN.** It is evidence that Testing already imports nothing it judges, and it keeps it that way.
