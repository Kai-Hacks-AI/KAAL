# Consumer Verifier Conformance: Testing

The planned outer tests live in `packages/skills/kaal-testing/test/plan/verifiers.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `testing/C30` turns them GREEN and adds them to Testing's `npm test`. The verifier in them is a made-up one, with Guard's words under its own prefix, and the facts are given as plain data.

| Case | Checks | Loop |
| --- | --- | --- |
| testing/T54: the contract names its scenarios, each with the change a harness makes and the result every conforming verifier shows, and covers at least hosting/F26's minimum set | testing/F43 | Requirements |
| testing/T55: a run is observed from its exit status and its one summary line, read through the verifier's declared words; anything else is no observation | testing/F44 | Requirements |
| testing/T56: a verifier that shows what the contract expects conforms in every scenario | testing/F45 | Requirements |
| testing/T57: a matching result label is never enough: exit status, cause, package, platform, Node, digest and every case's outcome are each compared with the harness's facts | testing/F45 | Requirements |
| testing/T58: a verifier that claims any other result than the scenario's never conforms, on zero or absent cases, a missing or tampered manifest or installation, skipped, todo or inapplicable cases, failures, or a changed consumer | testing/F46 | Requirements |
| testing/T59: a case is not applicable only where the harness established an explicit platform scope excluding the platform, and a reason; a skipped, todo or unsupported case claimed inapplicable never verifies | testing/F47 | Requirements |
| testing/T60: neither evasion verifies: a declared case silently omitted on a platform, or replaced there by a stand-in, stays visible as not run; an inapplicable case is never counted as passed | testing/F48 | Requirements |
| testing/T61: a run that is not verified reports its observation, its evidence or uncertainty, and a next step that claims no more than it knows; a verified run reports none | testing/F49 | Requirements |
| testing/T62: a case that needs an optional complement, present or absent, is not applicable only where the harness established that complement's opposite state and that it is optional; a missing required dependency never makes a case inapplicable, and never verifies | testing/F47 | Requirements |

## RED evidence

The tests run with `node --test packages/skills/kaal-testing/test/plan/verifiers.test.mjs`, outside Testing's `npm test` until `testing/C30`. At `testing/C29`, all nine are RED, each **blocked before behavioural assertion**, because kaal-testing exports no `./verifiers`.

**Checked against a throwaway implementation.** A18 was implemented outside the repository. All nine tests pass against it, and each of 73 mutants of it fails at least one test. The mutants cover:
- two summary lines accepted;
- result words that are not distinct;
- an undeclared word read as verified;
- the result or the expected exit status not compared;
- the cause rule loosened either way;
- the location, platform or Node version not compared;
- the digest not compared;
- a duplicate or missing case accepted;
- a case reported where none is declared;
- other cases' outcomes not compared;
- the targeted case's outcome taken as pass;
- no observation, or an unknown scenario, conforming;
- the scenarios left mutable;
- an inapplicable case expected unknown;
- a scenario dropped;
- the case shape not checked;
- any scenario's targeted outcome changed to pass;
- applicability read from an inherited key, its platform scope allowed to be empty or to include the platform, its reason allowed to be empty, the shown scope or reason not compared, or the claim not checked at all;
- the unsupported-inapplicability scenario dropped;
- an undeclared reported case accepted, the omission or substitution scenario dropped, or omission expected verified;
- the diagnosis not judged, a verified run's diagnosis accepted, malformed evidence or uncertainty accepted, neither evidence nor uncertainty accepted, an unnamed step kind or empty step accepted, a precise fix under uncertainty accepted, or an exploratory step other than analyze accepted;
- an empty platform or complement name accepted, a malformed complement list ignored beside a platform scope, a required dependency accepted as an absent complement, a complement's absence read from an inherited key or not checked, either exclusion dropped, the shown platforms or complements not compared, or a complement, dependency or complement-present scenario dropped or its result changed; and for `absent`, the complement's presence read from an inherited key, that exclusion dropped, the list unchecked for a required dependency, or the shown list not compared.

testing/F50 is checked by testing/T54 and testing/T58: each scenario's expected result is the tests' own, and a verifier that claims failed for a tampered installation, or for any other scenario that expects unknown, never conforms. The tests own each scenario's expected result, cases and target, so they never read their expectation from the implementation.

testing/N9 is checked by review of `testing/C30`: the module imports nothing.
