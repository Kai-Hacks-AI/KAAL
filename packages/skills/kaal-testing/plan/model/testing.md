# Testing Model: Testing

The planned outer tests live in `packages/skills/kaal-testing/test/plan/model.test.mjs`. Each title names the contract it checks. They are immutable to DO and CHECK. `testing/C15` turns them GREEN and adds them to Testing's `npm test`. The models and observed outcomes are plain data; the sample model is not a real Capability's.

| Test | Checks | Loop |
| --- | --- | --- |
| testing/T26: identities are the holder's: any nonempty string, unique across the model; Testing imposes no format, and a model whose Cases use another holder's identities is checked and evaluated like any other | testing/F24 | Requirements |
| testing/T27: only the levels a product uses are declared; a Case is defined once and may be in several Suites; a reference to an undeclared element is a finding | testing/F25 | Requirements |
| testing/T28: a Case's tests → subjects are opaque to Testing, of any kind; incoming views are derived, never declared | testing/N7 | Requirements |
| testing/T29: a Case is passed, failed, inapplicable only as the Plan declares it and only when it did not run, and otherwise unknown | testing/F26 | Requirements |
| testing/T30: Suite and Plan aggregation, and an empty Suite is unknown | testing/F27 | Requirements |
| testing/T31: an allowed Case stays failed, and the Plan's evaluation passes with its allowances listed | testing/F28 | Requirements |
| testing/T32: stale allowances; unknown is never allowed; an allowance outside the Plan, or malformed, leaves the Plan unevaluable | testing/F28 | Requirements |
| testing/T33: evaluation takes no baseline | testing/F29 | Requirements |
| testing/T34: the same inputs give the same results, and the inputs are not changed | testing/N8 | Requirements |
| testing/T35: `kaal-testing/model` is one module that imports nothing and names no other Capability's kind | testing/A12 | Architecture |

What stays validation: whether these kinds and results are the ones the Owner means, and whether a consumer's Plans fit them. Guard's `test/verify.json` and Change's FAR composition are the first two to try them.

## RED evidence

The tests run with `node --test packages/skills/kaal-testing/test/plan/model.test.mjs`, outside Testing's `npm test` until `testing/C15`. At `testing/C14`, all ten are RED, each **blocked before behavioural assertion**, because kaal-testing exports no `./model`.

They were checked against an uncommitted throwaway implementation: all ten pass. Eleven mutants of it each turn at least one planned test RED: an allowed Case shown passed (T31), an unknown Case allowed (T32), a declaration hiding an observed outcome (T29), a `base` option accepted (T33), an empty Suite passing (T30), a declared `testedBy` accepted (T28), subject kinds restricted (T26, T28, T31, T32, T35), duplicate identities allowed (T26, T27), an allowance outside the Plan accepted (T32), KAAL's `<capability>/T<n>` imposed on every Case (T26), and an empty identity allowed (T26).
