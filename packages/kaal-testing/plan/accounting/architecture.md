# Requirement Coverage: Architecture

Each element names, in brackets, the Requirements it answers.

- **testing/A19** [testing/F51–testing/F55, testing/N10]:
  - `kaal-testing/model` (testing/A12) gains the `targets` kind. `check` reports testing/F51's findings for it. `tested` is unchanged.
  - `kaal-testing/verifiers` (testing/A18) imports `check` and `tested` from `kaal-testing/model` and nothing else. It gains:
    - `account(facts, outcomes?)`, which gives `{ entries, result, findings }`. `entries` holds one `{ id, state }` per shipped identifier, then one per `not shipped` identifier. `result` is the coverage's effect (testing/F53), and `findings` are the model's findings and what the harness did not establish. Without `outcomes`, it is the static trace (testing/F51). `outcomes` maps a declared case to its outcome in one run, and a case it does not name is `not run`.
    - `COVERAGE_SCENARIOS`, the frozen list of `{ id, change, state, result, cases, target? }`, in testing/A18's scenario shape.
    - `judgeCoverage(scenario, observed, facts)`, which gives `{ scenario, conforms, differences }`. It compares every observable `judge` compares, then the reported coverage against `account(facts, outcomes)`.

  `facts` is testing/A18's, plus:
  - `identifiers`, the identifiers the package ships, as the harness read them from its shipped documents;
  - `model`, the package's Testing model as its manifest delivers it.

  There is no manifest `coverage` declaration. `observe` passes the summary's `coverage` through. `SCENARIOS` and `judge` are unchanged, so testing/T54–testing/T62 stand as planned. The export inventory rows for `./model` and `./verifiers` (testing/A8) cover the additions.

## Ownership

| Who | Owns |
| --- | --- |
| Testing | the model's kinds, including `targets`; what covered, allocated, unverified, not applicable, uncovered, failed and not shipped mean; their effect on the result; and the coverage scenarios |
| Each package | its model: which cases trace which identifier, what each allocation names, and each reason |
| Packaging | requiring a resolved trace of every shipped Requirement (packaging/F13), through its conformance suite (packaging/A7) |
| Engineering | the harness: reading the shipped identifiers, making each coverage scenario's change, running the verifier and calling `judgeCoverage` (#625, #610), and the publisher's Engineering Test Plan that an allocation names |

## Product follow-up map

What each product's plan would need to adopt these meanings. Each product changes in its own Change. Each keeps its own words and summary shape until it adopts testing/F55.

| Product | Today | Change needed |
| --- | --- | --- |
| Guard | guard/F38, guard/F40: the same states, `cannot verify` for uncovered | derive its trace from its delivered model; its summary carries one `{ id, state }` per identifier |
| Hosting | hosting/F23, hosting/F25: an identifier covered only by not-applicable cases "does not keep the run from verified" | hosting/F25 follows testing/F53: such an identifier is not applicable only where each of its cases is, by established applicability |
| Core | core/F71 | its manifest delivers its model once it has a manifest (packaging/F11) |
| Graph | graph/F5: cited identifiers exist, no allocation | records allocations and reasons as target entries (testing/F51) |
| Change | change/F20: definition only | records allocations and reasons as target entries (testing/F51) |
| Testing | `test/verify.json` delivers `model.cases` (`testing/C38`) | its verifier reports `coverage` once `testing/C34` lands |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `testing/C33` PLAN, this Change | Testing | none |
| `testing/C34` DO: the `targets` kind in `kaal-testing/model`; `account`, `COVERAGE_SCENARIOS` and `judgeCoverage` in `kaal-testing/verifiers`; testing/T63–testing/T69 GREEN in Testing's `npm test`; the implementation test for testing/N9 amended to admit the one sibling import | Testing | `testing/C33` |
| packaging/F13 in Packaging's suite references these meanings | Packaging | `testing/C34` |
| `engineering/C…` the harness runs the coverage scenarios (#625) | Engineering | `testing/C34` |
| Each product adopts testing/F55 | each product | `engineering/C…` |
