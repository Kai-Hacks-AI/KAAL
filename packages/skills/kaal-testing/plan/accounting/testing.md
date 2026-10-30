# Requirement Coverage: Testing

The planned outer tests live in `packages/skills/kaal-testing/test/plan/accounting.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `testing/C34` turns them GREEN and adds them to Testing's `npm test`. The verifier in them is a made-up one, and the facts are given as plain data. The tests own each scenario's expected states and result, so they never read their expectation from the implementation.

| Case | Checks | Loop |
| --- | --- | --- |
| testing/T63: the static trace gives each shipped identifier one state from the declaration, and is unresolved where an identifier has none or the declaration names one the package does not ship | testing/F51 | Requirements |
| testing/T64: in a run, an identifier is covered only where a declared case covering it passed; any failing case fails it; cases that did not pass leave it uncovered | testing/F52 | Requirements |
| testing/T65: an identifier whose only cases are not applicable is not applicable only where the declaration gives it an established applicability excluding the run; otherwise it is not verified here | testing/F52, testing/F53 | Requirements |
| testing/T66: failed is established by a failing case; otherwise any uncovered, not verified here or not shipped identifier makes the run unknown; allocated, unverified and not applicable never count as covered and never change verified | testing/F53 | Requirements |
| testing/T67: the contract names its coverage scenarios, each with the change a harness makes, the state it realizes and the result every conforming verifier shows | testing/F54 | Requirements |
| testing/T68: a verifier that shows what the contract expects conforms in every coverage scenario; any other reported coverage or result never conforms | testing/F55 | Requirements |
| testing/T69: facts that do not realize a scenario never conform, and every observable testing/F45 compares is still compared | testing/F55, testing/F45 | Requirements |

## RED evidence

The tests run with `node --test packages/skills/kaal-testing/test/plan/accounting.test.mjs`, outside Testing's `npm test` until `testing/C34`. At `testing/C33`, all seven are RED, each **blocked before behavioural assertion**, because `kaal-testing/verifiers` exports no `account`.

**Checked against a throwaway implementation.** A19 was implemented on top of `testing/C30`'s module, outside the repository. All seven pass against it, and so do testing/T54–testing/T62 and `test/verifiers.test.mjs`, unchanged. Each of 43 mutants of the additions fails at least one test. The mutants cover:
- **The declaration:**
  - an identifier list that is missing, empty or duplicated accepted;
  - no declaration accepted;
  - an entry read from an inherited key;
  - no entry read as covered;
  - two forms accepted;
  - an empty statement or reason accepted, or an applicability beside one;
  - an undeclared case accepted;
  - the trace reporting `covered` rather than `traced`;
  - `not shipped` dropped.
- **The run states:**
  - a missing outcome read as pass;
  - a failing case not failing its identifier;
  - a skipped case covering;
  - one not-applicable case among others treated as all;
  - the identifier's applicability not established, or only checked for presence;
  - the fall-through state read as covered.
- **The effect:**
  - findings, failed, uncovered, not verified here or not shipped each dropped from the result;
  - allocated made unknown.
- **The scenarios:**
  - a result changed or a scenario dropped;
  - a targeted outcome removed;
  - the scenarios left mutable.
- **Judging:**
  - the facts' realization or their result not checked;
  - `coverage-complete` realized by any facts;
  - the coverage shape not checked;
  - a duplicate, missing, extra or differently-stated identifier accepted;
  - the base comparison dropped;
  - an unknown scenario judged;
  - case outcomes ignored for the account;
  - `observe` not passing coverage through.

Two mutants were removed as equivalent:
- dropping the account's findings from the differences, since findings already make the account's result disagree with the scenario's;
- checking a state's word only for being nonempty, since the per-identifier comparison already refuses an unnamed state.

testing/N10 is checked by review of `testing/C34`: the module still imports nothing.
