# Requirement Coverage: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **testing/F51** [testing/I15]: **The declaration and its static trace.** The harness establishes two things:
  - the identifiers the package ships, from its shipped documents;
  - the manifest's `coverage` declaration, which maps each identifier to exactly one entry:
    - `{ cases, applicability? }`: a nonempty list of declared cases, with an optional applicability in testing/F47's form;
    - `{ allocated }`: a nonempty statement of what the publisher's Engineering Test Plan runs;
    - `{ unverified }`: a nonempty reason that no Test Case verifies it.

  Without a run, each identifier is `traced`, `allocated` or `unverified`. Anything else is `uncovered`:
  - no entry, or an entry inherited rather than declared;
  - no form, or two forms;
  - an empty statement or reason;
  - an applicability beside an allocation or a reason;
  - no case, or a case the manifest does not declare.

  An entry for an identifier the package does not ship is `not shipped`. The trace is unresolved (unknown) when any identifier is uncovered or not shipped, or when the harness established no list of distinct identifiers or no declaration. This is packaging/F13's trace.
- **testing/F52** [testing/I15]: **States in a run.** Given each declared case's outcome in one run, an identifier declared with cases is:
  - `failed` when any of its cases failed, even beside one that passed;
  - otherwise `covered` when any of its cases passed;
  - otherwise, when every one of its cases is `not applicable`:
    - `not applicable` only where its own entry gives an applicability that the harness established excludes this run, under testing/F47's rules: a reason, an excluding platform scope, or an optional complement in the opposite state, never a required dependency;
    - otherwise `not verified here`;
  - otherwise `uncovered`, as when its cases were skipped, todo or not run.

  `allocated`, `unverified`, `uncovered` and `not shipped` carry over from testing/F51.
- **testing/F53** [testing/I15]: **The effect on the result.** Coverage never turns a failure into anything else, and never makes a run verified. The run is:
  - `failed` when an identifier is failed, since a case's failure is established (testing/F50);
  - otherwise `unknown` when any identifier is uncovered, not verified here or not shipped, or the harness established no identifiers or no declaration;
  - otherwise verified.

  `allocated`, `unverified` and `not applicable` never count as covered, and never change verified. This settles the difference between guard/F40 and hosting/F25. An identifier covered only by not-applicable cases is not verified here, and the run is unknown, unless its entry declares that applicability itself.
- **testing/F54** [testing/I15]: **The coverage scenarios.** The contract names each coverage scenario: its identity, the one change the harness makes to the manifest's coverage, the state that change realizes, and the result every conforming verifier then shows. There are at least these:
  - **verified:** every identifier covered; one allocated; one unverified; one whose only cases are not applicable, with the identifier declared not applicable by an applicability that excludes the run;
  - **unknown:** one identifier with no entry; one covered only by a case the manifest does not declare; one whose only cases are not applicable, without its own applicability; an entry for an identifier the package does not ship;
  - **failed:** the case covering an identifier fails.

  A caller cannot change them. They are separate from testing/F43's scenarios, which they leave unchanged.
- **testing/F55** [testing/I15]: **Judging reported coverage.** A verifier's summary also holds `coverage`: one `{ id, state }` per identifier, in the states of testing/F51 and testing/F52. An observation conforms to a coverage scenario only when both hold:
  - every observable testing/F45 compares agrees;
  - its coverage is exactly the account of the harness's facts, given the scenario's case outcomes (every declared case passes, except the targeted case, which has the scenario's outcome).

  So an identifier left out, reported twice, reported in another state, or reported though the harness established none never conforms. Nor does a missing `coverage`. Facts that do not realize the scenario's state and result never conform, so a harness that did not make the change cannot certify the behaviour. A verified run that conceals an allocated, unverified or not applicable identifier does not conform.

## Nonfunctional

- **testing/N10** [testing/I15]: The accounting is pure, as testing/N9 states for the contract. `account` and `judgeCoverage` read nothing from a host, run nothing, keep nothing and change no input. Testing does not read a package's documents. The harness establishes the identifiers.
