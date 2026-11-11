# C5 transition

How the new realization is introduced, and the old one retired, without a moment of less protection. Every step is additive until S5. The old workflow keeps running until the new one is observed. Each step is its own Change into the collector, reviewed before the next. The workflow steps carry a `.github` path and so travel alone.

## Sequence

| Step | Change | Class | Turns green |
| --- | --- | --- | --- |
| S0 | The judge `05-src/dependency-verdict/judge.mjs` (A25) and its Cases. | Improve | T87, T88, T89, T90 |
| S1 | The control is declared for its places (`.kaal/config/guard/Verify-Dependencies.md`, `runs: [ci]`). Observation of whether Guard can bind an action-run check comes first. | Improve | T82 |
| S2 | The new realization: a workflow with the job of F9 on `pull_request` and `merge_group`, explicit severity, no skip. It runs beside the old one. | Improve | T83 |
| S3 | Observation: the stable name on real pull requests into a collector and into `main`, a merge group on a scratch target, one FAIL on a throwaway pull request that adds a known-vulnerable dependency. The replay compares the new verdicts with the old job's last runs. | Evidence | T86 |
| S4 | Not this Change: the aggregates `guard Integration` and `guard Promotion` exist, with the Owner's go, and fan in the declaration. This Change then shows the verdict of Dependency Review inside the aggregate, or reports that it is not bound yet. No ruleset line is added for the control. | Evidence | T84 |
| S5 | `dependency-review.yml` is removed, once S3 holds. It does not wait for S4: the old job is bound nowhere, so removing it reduces nothing. The uncovered-gate line of `engineering/controls/README.md` is edited. | Terminate | T85 |

The Cases are renamed to `.test.mjs` and listed in Engineering CI in the Change that makes them green, which is also the known wiring gap of create Plan.

## Equivalence and acceptance evidence

The observations of `acceptance.md` (A1 to A6) are the equivalence and operational evidence. The judge's behaviors are Cases (T87 to T89). Observed results and proposed tests are kept apart there, and nothing in this PLAN is observed beyond what it states.

## Scope by place

| Place | Declared when |
| --- | --- |
| Integration IN | A1, A2, A3 and A5 are observed |
| Promotion IN | A4 is also observed. If it is not, the control is not declared there, no promotion binding is proposed, and the scope is Integration IN alone, stated as such |
| Development OUT | not realized by this Change |

## Fallback

Until S5 a step is undone by reverting its Change and the old job has not stopped. This Change touches no ruleset, so no ruleset fallback exists. After S5 the old workflow returns by reverting its removal.

## Acceptance of the DO

T72 to T90 green, A1 to A5 observed (A4 may be reported as not observed, with the scope above), no ruleset changed, and Engineering CI running the Cases.

## Retirement of the old realization

`dependency-review.yml` is removed only when all of these hold: the new job has been observed reporting for the old job's whole scope, pull requests into `main` and into `kaal/**` (A3, A5); a vulnerable addition and an UNKNOWN have been observed (A1, A2); the DO acceptance above holds; and the Owner has accepted the evidence. A binding at any place is declared and validated for that place separately and is not a condition of the retirement, because the old job is bound nowhere.
