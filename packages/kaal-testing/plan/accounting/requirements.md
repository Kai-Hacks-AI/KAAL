# Requirement Coverage: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **testing/F51** [testing/I15]: **The trace is the model's.** The harness establishes two things:
  - the identifiers the package ships, from its shipped documents;
  - the package's Testing model, as its manifest delivers it (testing/F24–testing/F25).

  An identifier is traced by the declared, unretired cases whose `tests` name it. That is the only trace: nothing else states which case covers which identifier. The model gains one kind, `targets`, for what a trace cannot say. Each entry is `{ id, allocated }`, a nonempty statement of what the publisher's Engineering Test Plan runs, or `{ id, unverified }`, a nonempty reason that no Test Case verifies it. An entry names no case and no applicability. Each of these is a finding of the model (testing/F25):
  - an entry with no form, two forms, an empty statement or reason, or any other key;
  - two entries for one identifier;
  - an entry for an identifier a Case traces, since an allocation or reason never stands beside a trace.

  `tested` is unchanged: an entry adds no trace.

  Without a run, each shipped identifier is `traced`, `allocated` or `unverified`. Anything else is `uncovered`:
  - no declared case traces it and no entry states it;
  - only a case the manifest does not declare, or a retired case, traces it;
  - its entry is malformed, repeated, or beside a trace.

  An identifier a declared case traces, or an entry states, that the package does not ship is `not shipped`. The trace is unresolved (unknown) when any identifier is uncovered or not shipped, when the model has a finding, or when the harness established no list of distinct identifiers or no model. This is packaging/F13's trace.
- **testing/F52** [testing/I15]: **States in a run.** Given each declared case's outcome in one run, a traced identifier is:
  - `failed` when any case tracing it failed, even beside one that passed;
  - otherwise `covered` when any case tracing it passed;
  - otherwise `not applicable` when every case tracing it is `not applicable` by an applicability the harness established excludes this run, under testing/F47's rules: a reason, and an excluding platform scope or an optional complement in the opposite state, never a required dependency;
  - otherwise `uncovered`, as when its cases were skipped, todo, not run, or claimed not applicable without that established applicability.

  `allocated`, `unverified`, `uncovered` and `not shipped` carry over from testing/F51. An applicability never hides a case observed passing or failing.
- **testing/F53** [testing/I15]: **The effect on the result.** Coverage is evidence. It never turns a failure into anything else, and never makes a run verified by itself. The run is:
  - `failed` when an identifier is failed, since a case's failure is established (testing/F50);
  - otherwise `unknown` when any identifier is uncovered or not shipped, the model has a finding, or the harness established no identifiers or no model;
  - otherwise verified, if the run is otherwise verified.

  `allocated`, `unverified` and `not applicable` never count as covered, and never change verified. A verified run lists each of them. This settles the difference between guard/F40 and hosting/F25 without a second declaration: an identifier covered only by not-applicable cases is not applicable only when each of those cases is, by the applicability the harness established and testing/F47 already requires to carry a reason. Otherwise it is uncovered, and the run is unknown.
- **testing/F54** [testing/I15]: **The coverage scenarios.** The contract names each coverage scenario: its identity, the one change the harness makes to the delivered model or the run, the state that change realizes, and the result every conforming verifier then shows. There are at least these:
  - **verified:** every identifier covered; one allocated; one unverified; one whose only tracing case is not applicable by an established applicability;
  - **unknown:** one identifier with no trace and no entry; one traced only by a case the manifest does not declare; one allocated and also traced; a trace of an identifier the package does not ship;
  - **failed:** a case tracing an identifier fails.

  A caller cannot change them. They are separate from testing/F43's scenarios, which they leave unchanged.
- **testing/F55** [testing/I15]: **Judging reported coverage.** A verifier's summary also holds `coverage`: one `{ id, state }` per identifier, in the states of testing/F51 and testing/F52. An observation conforms to a coverage scenario only when both hold:
  - every observable testing/F45 compares agrees;
  - its coverage is exactly the account derived from the harness's facts, given the scenario's case outcomes (every declared case passes, except the targeted case, which has the scenario's outcome).

  So an identifier left out, reported twice, reported in another state, or reported though the harness established none never conforms. Nor does a missing `coverage`. Facts that do not realize the scenario's state and result never conform, so a harness that did not make the change cannot certify the behaviour. A verified run that conceals an allocated, unverified or not applicable identifier does not conform.

## Nonfunctional

- **testing/N10** [testing/I15]: The accounting is pure, as testing/N9 states for the contract. `account` and `judgeCoverage` read nothing from a host, run nothing, keep nothing and change no input. Testing does not read a package's documents: the harness establishes the identifiers. This amends testing/N9 in one respect: `kaal-testing/verifiers` imports `kaal-testing/model`, its own sibling, so that the trace is read through the model's `check` and `tested`, never re-derived.
