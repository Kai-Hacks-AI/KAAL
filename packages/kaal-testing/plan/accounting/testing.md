# Requirement Coverage: Testing

The planned outer tests live in `packages/skills/kaal-testing/test/plan/accounting.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `testing/C34` turns them GREEN and adds them to Testing's `npm test`. The verifier in them is a made-up one, and the facts, including the model, are given as plain data. The tests own each scenario's expected states and result, so they never read their expectation from the implementation.

| Case | Checks | Loop |
| --- | --- | --- |
| testing/T63: the static trace derives each shipped identifier's state from the model's Case traces and target entries, and is unresolved where an identifier has none, an entry restates a trace, or a trace names one the package does not ship | testing/F51, testing/F25 | Requirements |
| testing/T64: in a run, an identifier is covered only where a declared case tracing it passed; any failing case fails it; cases that did not pass leave it uncovered | testing/F52 | Requirements |
| testing/T65: an identifier whose every tracing case is not applicable is not applicable only where the harness established each case's applicability excluding the run; otherwise it is uncovered | testing/F52, testing/F47 | Requirements |
| testing/T66: failed is established by a failing case; otherwise any uncovered or not shipped identifier, or a model finding, makes the run unknown; allocated, unverified and not applicable never count as covered and never change verified | testing/F53 | Requirements |
| testing/T67: the contract names its coverage scenarios, each with the change a harness makes to the delivered model or run, the state it realizes and the result every conforming verifier shows | testing/F54 | Requirements |
| testing/T68: a verifier that shows what the contract expects conforms in every coverage scenario; any other reported coverage or result never conforms | testing/F55 | Requirements |
| testing/T69: facts that do not realize a scenario never conform, and every observable testing/F45 compares is still compared | testing/F55, testing/F45 | Requirements |

## RED evidence

The tests run with `node --test packages/skills/kaal-testing/test/plan/accounting.test.mjs`, outside Testing's `npm test` until `testing/C34`. At `testing/C33`, all seven are RED, each **blocked before behavioural assertion**, because `kaal-testing/verifiers` exports no `account`.

**Checked against a throwaway implementation.** A19 was implemented on top of the current `kaal-testing/model` and `kaal-testing/verifiers`, outside the repository. All seven pass against it, and so do testing/T54–testing/T62, the model's planned and implementation tests, and every `test/verifiers.test.mjs` case except the one for testing/N9's "imports nothing", which testing/N10 amends and `testing/C34` updates. Each of 44 mutants of the additions was run, and all but two fail at least one test. The mutants cover:
- **The model:**
  - `targets` not a kind, or indexed as identities;
  - an entry with two forms, an empty statement, or an unknown key accepted.
- **The trace:**
  - an identifier list that is duplicated or empty accepted;
  - no identifiers, no model, or the model's findings dropped;
  - a trace by an undeclared case counted;
  - an entry beside a trace accepted;
  - the trace reporting `covered` rather than `traced`;
  - repeated, keyed-beyond-form, multi-form or empty entries read as stated;
  - `not shipped` dropped.
- **The run states:**
  - a missing outcome read as pass;
  - a failing case not failing its identifier;
  - any non-failing case covering;
  - one not-applicable case among others treated as all;
  - applicability not established;
  - the fall-through state read as covered.
- **The effect:**
  - findings, uncovered, not shipped or failed each dropped from the result;
  - allocated made unknown.
- **The scenarios:**
  - a scenario dropped;
  - a targeted outcome removed;
  - the scenarios left mutable.
- **Judging:**
  - the facts' result or their realization not checked;
  - `coverage-complete` realized by any facts;
  - a duplicate, missing, extra or differently-stated identifier accepted;
  - the base comparison dropped;
  - case outcomes ignored for the account;
  - `observe` not passing coverage through.

Two mutants survive, and both are equivalent:
- checking a state's word only for being nonempty, since the per-identifier comparison already refuses an unnamed state;
- judging a testing/F43 scenario as a coverage scenario, since such a scenario names no coverage state, so the facts never realize it.

testing/N10 is checked by review of `testing/C34`: `kaal-testing/verifiers` imports only `kaal-testing/model`.
