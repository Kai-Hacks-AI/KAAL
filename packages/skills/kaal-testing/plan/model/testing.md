# Testing Model: Testing

The planned outer tests live in `packages/skills/kaal-testing/test/plan/model.test.mjs`. Each title names the contract it checks. They are immutable to DO and CHECK. `testing/C15` turns them GREEN and adds them to Testing's `npm test`. The models and Runs are plain data; the sample model is not a real Capability's.

| Test | Checks | Loop |
| --- | --- | --- |
| testing/T26: identities are the holder's: any nonempty string, unique across the model; Testing imposes no format, and a model whose Cases use another holder's identities is checked and evaluated like any other | testing/F24 | Requirements |
| testing/T27: only the levels a product uses are declared; a Strategy names at least one Plan and a Plan at least one Suite; a Case is defined once and may be in several Suites; a reference to an undeclared element is a finding | testing/F25 | Requirements |
| testing/T28: a Case's tests → subjects are opaque to Testing, of any kind; incoming views are derived, never declared; no result says anything about a subject | testing/N7 | Requirements |
| testing/T29: a Case is passed, failed, inapplicable only as the Plan declares it and only when it did not run, and otherwise unknown | testing/F26 | Requirements |
| testing/T30: Suite and Plan aggregation, and an empty Suite is unknown | testing/F27 | Requirements |
| testing/T31: an allowed Case stays failed, and the Plan's evaluation passes with its allowances listed | testing/F28 | Requirements |
| testing/T32: stale allowances; unknown is never allowed; an allowance outside the Plan, or malformed, leaves the Plan unevaluable | testing/F28 | Requirements |
| testing/T33: evaluation takes no baseline and no retention | testing/F29, testing/F33 | Requirements |
| testing/T34: the same model and Run give the same results, and the inputs are not changed | testing/N8 | Requirements |
| testing/T36: a Plan, a Suite or a Case runs on its own, any number of times; a Plan Run may encompass Suite Runs and a Suite Run Case Runs; each Run holds its own Case Results, apart from the definitions | testing/F30 | Requirements |
| testing/T37: a Run's provenance identifies the definitions and versions it executed and its effective Test Data; a Case Result counts only for the definition it identifies | testing/F31 | Requirements |
| testing/T38: Test Data is defined at Plan, Suite or Case level and owned by its defining context; reuse leaves ownership where it is; its content is opaque and may be external | testing/F32 | Requirements |
| testing/T39: a retired Case stays declared as provenance and is no longer executable; Testing keeps no Run | testing/F33 | Requirements |
| testing/T35: `kaal-testing/model` is one module that imports nothing and names no other Capability's kind | testing/A12 | Architecture |

What stays validation: whether these kinds and results are the ones the Owner means, and whether a consumer's Plans fit them. Guard's `test/verify.json` and Change's FAR composition are the first two to try them.

## RED evidence

The tests run with `node --test packages/skills/kaal-testing/test/plan/model.test.mjs`, outside Testing's `npm test` until `testing/C15`. At `testing/C14`, all fourteen are RED, each **blocked before behavioural assertion**, because kaal-testing exports no `./model`.

They were checked against an uncommitted throwaway implementation: all fourteen pass. Twenty-eight mutants of it were run. Twenty-six each turn at least one planned test RED, among them: an allowed Case shown passed (T26, T31, T32), an unknown Case allowed (T32), a declaration hiding an observed outcome (T29), a `base` or `retain` option accepted (T33), an empty Suite passing (T29, T30, T32, T39), a declared `testedBy` accepted (T28), a result naming a subject (T28), duplicate or empty identities allowed (T26, T27), an allowance outside the Plan accepted (T32), a Strategy with no Plan allowed (T27), a provenance version ignored (T37), an outcome counted without provenance (T37), encompassed Runs ignored (T36), a Case in two Suites collapsed to one result per Suite (T36), a Strategy Run or an outcome outside the Run's element accepted (T36), one Run's outcomes carried into the next (T30, T31, T32, T36), reuse moving Test Data's ownership (T38), undeclared Test Data accepted (T37, T38), and a retired Case selectable by a Suite or still listed as testing its subject (T39). The other two each remove one of two guards against running a retired Case. Each guard alone keeps T39 GREEN, and removing both turns it RED.
