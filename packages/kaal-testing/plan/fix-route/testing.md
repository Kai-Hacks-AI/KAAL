# Failures point at the route to fix: Testing

The planned outer tests will live in `packages/kaal-testing/test/plan/fix-route.test.mjs`, one title per Case naming the contracts it checks. This PLAN states them and does not write the file: it follows approval, so that no RED file sits unreferenced on `kaal/testing`. The DO turns them GREEN and adds the file to Testing's scripts. No existing Case is changed.

| Case | Checks |
| --- | --- |
| testing/T148: a Case with `route: { do, where? }` has no finding; a `route` that is not an object, with an empty `do`, or with another member is a finding naming the Case | testing/F122 |
| testing/T149: a failed and an unknown Case each carry a `response` with identity, result, version, the Run's recorded `expected` and `observed` text unchanged (`null` where none was recorded), and the declared route; a passed Case carries none | testing/F123 |
| testing/T155: a failed assertion's message, expected and actual values are emitted by the reporter, retained by Testing, accepted by a Run's `diagnostics` and bounded in size; a failure without values records only the message; a diagnostic Testing did not observe is not accepted | testing/F128, testing/A37 |
| testing/T150: without a declared route the `response` carries the computed route from the graph (targets and owner only); with no graph it is `null` and the result lists `no route declared` under the Case identity; the result itself is unchanged | testing/F123, testing/F124 |
| testing/T151: a computed route contains no command, path to edit or fix, and a declared `do` is carried verbatim | testing/F125 |
| testing/T152: with and without a route, the result, the Plan's evaluation and `passed` are identical, and a declared route never makes a failed or unknown Case pass | testing/F126 |
| testing/T153: the markdown and JSON reports list each failed or unknown Case's `response` in identity order, and an `unknown` result with a declared route lists it | testing/F127 |
| testing/T154: the same inputs give the same `response` in the same order; `results` reads no host or clock and imports only Testing's model | testing/N26, testing/A35 |

## RED evidence

Not yet shown. Testing's Case has no `route` and `results` returns no `response`, so at the DO every Case above fails before a behavioural assertion, as testing/T116–testing/T122 did for `./defect`.

## Trace

testing/I36 is served by testing/F122–testing/F125, testing/F127 and testing/F128, testing/I37 by testing/F126; both are realized by testing/A35, testing/A36 and testing/A37. Release management's recovery PLAN is the first consumer and keeps its own Cases.
