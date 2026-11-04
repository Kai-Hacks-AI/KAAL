# Applicability by Host Fact: Architecture

Each element names, in brackets, the Requirements it answers.

- **testing/A22** [testing/F68–testing/F71, testing/N14]: `lib/verifiers.mjs` (testing/A18) changes in two places only:
  - `established(facts, name)` gains the fourth way, reading `facts.hostFacts`;
  - the comparison of a shown applicability with the established one also compares `host`, as a set, and `evidence`.

  The `not-applicable` scenario's `change` text names a host fact as well as a platform scope. `facts` gains `hostFacts`, optional: where the harness established none, no case is not applicable by host fact. testing/A18's facts are otherwise unchanged.

## Ownership

| Who | Owns |
| --- | --- |
| Testing | how a host declaration is verified and counted: established, never asserted; shown in full; never passed; run where the fact holds |
| Hosting | the host facts and `facts()` that establishes them, the fixtures, the declaration rules, the portability audit and the per-host review guide (`hosting/C16`, #674) |
| Review | whether each host exception is genuine, on Hosting's review request (hosting/F40) |
| Engineering | calling `facts()` on each run and passing it to `judge` as `hostFacts`, beside the other facts its harness establishes (#625, #641) |
| Each capability | its own declarations, such as guard/T114's |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `testing/C39` PLAN, this Change | Testing | `hosting/C16` (#674, approved) |
| `testing/C40` DO: `established` and the comparison in `lib/verifiers.mjs`, the scenario text, testing/T80–testing/T83 GREEN and in the suite | Testing | `testing/C39` |
| Engineering's harness passes `hostFacts` from Hosting's `facts()` | Engineering | `testing/C40`, `hosting/C17` |
| guard/T114 declares `host: ["kaal-hosting/special-entries"]` | Guard | `hosting/C17`, `testing/C40` |
