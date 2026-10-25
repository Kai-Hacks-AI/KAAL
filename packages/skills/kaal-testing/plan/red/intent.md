# RED Evidence and Accepted Regressions: Intent

This is `testing/C4`, a PLAN Change. The Owner's review of #381 (review 5643166494) found that `node:test` `todo` and `skip` markers hide RED evidence, and routed the governance of failing tests to PLAN. Testing owns what a RED means and how it is reported. Engineering owns enforcement in CI and at promotion, and Guard executes and reports. This Change plans Testing's part. It ships no code, and `testing/C5` turns its tests GREEN.

Development and promotion accept different things. On a `kaal/*` collector, a new Feature RED or a regression the Owner explicitly accepted may exist, as long as it stays visible, classified and traceable. Promotion to `main` must account for every Feature RED and every Regression RED. Only the specific regressions the Owner accepted may be subtracted. This is a set-based rule, not a count: accepting one failure never cancels another.

- **testing/I1**: A RED is evidence and is never hidden. Every failing Test Case is reported under its own identity and class, and nothing presents a failure as GREEN.
- **testing/I2**: Accepting a regression is specific and bounded. It takes an explicit, recorded Owner decision that names the exact Test Cases and the collector, and it holds until a stated expiry. It never covers any other failure.
- **testing/I3**: Testing defines the meaning, and Testing alone. Engineering's gates and Guard's lane consume Testing's classification and verdict. Neither carries an acceptance policy of its own.
