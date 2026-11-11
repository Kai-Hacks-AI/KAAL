# C4 transition

How the new realization is introduced without interrupting the existing protection. Every step is additive until S6. The existing checks keep running, and the required contexts Change Isolation and Change Isolation (review) are never renamed, moved or made optional, so no ruleset changes. Each step is its own Change into the collector, reviewed before the next. 

## Sequence

| Step | Change | Class | Turns green |
| --- | --- | --- | --- |
| S1 | The judge exports `judge(paths, options)` returning PASS, FAIL or UNKNOWN with the offending paths, and `--json --place <boundary>` prints the record. The exit statuses of the command line do not change. | Improve | T56, T58, T60, T67, T69 |
| S2 | The replay of the equivalence tests below, in `00-changes/C4-change-isolation/replay.mjs`. | Enhance | T71 |
| S3 | `Change-Isolation.md` declares `runs: [ci, hook]`, and the hook runs it through the same adapter as CI, with the target's ledger. `push` still judges Change Isolation, so both report for a while. | Improve | T65 |
| S4 | Observation: records are collected at the three places on real pull requests and pushes, as listed below. | Evidence | none |
| S5 | The Cases are renamed to `.test.mjs` and listed in Engineering CI, with the four green `.red.mjs` files. | Improve | the Cases run |
| S6 | The Change Isolation block of `push-check.sh` and the mention in `push.md` are removed once the retirement criteria hold. | Terminate | T57 |

S1 to S3 and S5 to S6 are engineering Changes and may not carry a `.github` path. A workflow change is not needed by this sequence. If one is found to be needed it is its own `.github` Change.

## Equivalence tests

A realization is equivalent to the legacy one when it gives the same verdict for the same Change. The tests compare the new verdict function and the hook adapter with the legacy command line.

- **E1, history.** Every first-parent landing of `main` since the judge exists. Legacy baseline observed: 135 conform, 3 do not by path rules alone. With the target's ledger supplied, all conform. The new judge agrees landing for landing.
- **E2, failures.** The heads of the recorded failing runs, fetched from `refs/pull/<n>/head`, each judged against the base it had: the legacy verdict, the check result on GitHub and the new verdict agree.
- **E3, the hook.** The hook adapter and the CI adapter, run for the same base and head pairs of E1 and E2, agree. This is the test that fails today, for the three ledger landings (H1).
- **E4, rules.** One fixture per rule and per refusal: Core with another path, `.github` with another path, Core with a supporting file, an exact ledger entry, a stale entry, one path more or fewer than an entry, a malformed ledger (UNKNOWN), a missing Git fact (UNKNOWN). Legacy and new agree on each.

## Observed evidence required (S4)

Enough to show equivalence, not a quota. This is a lab, so no legacy realization is kept alive for its own sake: once the evidence below is recorded once, the legacy part is retired.

- At Integration IN, a record whose verdict equals the check result on GitHub for a real pull request, and one FAIL on a throwaway pull request into a scratch collector.
- At Promotion IN, the record of one group run.
- At Development OUT, a hook run with a record on a ledger-admitted change.
- That a FAIL holds a merge group back is observed once on a scratch target, or is reported as not observed. It is not claimed.

## Fallback

Until S6, a step is undone by reverting its Change, and the legacy checks have not stopped running. If any equivalence test disagrees, the migration stops at that step, the disagreement is recorded as a defect of the new realization, and the legacy one stays. If a required context stops appearing on a head, the revert is the first action.

## Acceptance of the DO

T55 to T71 green, E1 to E4 passing, S4 evidence recorded, the rulesets exported before and after with no difference, and Engineering CI running the Cases.

## Retirement of the legacy machinery

Only the Change Isolation block of `push-check.sh` and its mention in `push.md` are retired. They are retired when E3 passes over the whole corpus, the S4 evidence is recorded, and the CPO has accepted both. Retirement waits for that evidence and for nothing else. The ledger, the attestation machinery, the workflows and the rulesets are retained. The section of `engineering/controls/README.md` is retired when the DO closes.
