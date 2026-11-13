# C5 transition

How the new realization is introduced, and the old one retired, without a moment of less protection. Every step is additive until S5. The old workflow keeps running until the new one is observed. Each step is its own Change into the collector, reviewed before the next. The workflow steps carry a `.github` path and so travel alone.

## Status of the control: detective

The control is a detective control, and this PLAN does not make it preventive. It stays detective at a target until the ruleset of that target requires its check, on the Owner's go, and until then it reports itself as not bound. The real merge-group observation (A4) is mandatory before Promotion is declared or its context is required.

## Sequence

| Step | Change | Class | Turns green |
| --- | --- | --- | --- |
| S0 | The interpreter `05-src/vulnerability-analysis/interpreter.mjs` (A25) and its Cases. | Improve | T87, T88, T89, T90 |
| S1 | The adapter `05-src/vulnerability-analysis/analyze.mjs` (A26): the command Guard runs after the analysis step. It reads the mechanism's result from the environment, prints the record and ends with 0 for PASS, 1 for FAIL and 2 for UNKNOWN. | Improve | T109 |
| S2 | The new realization, in `.github` alone: a workflow per target on `pull_request`, and `merge_group` for Promotion, with the analysis step and a step `npx --no kaal-guard run --check <name> --github`, no skip. It runs beside the old one. It is not required anywhere, so its job fails harmlessly until S2b lands. | Improve | T83, moved to release/C18 |
| S2b | The declaration `.kaal/config/guard/<name>.md` (`command` the adapter, `runs: [ci]`), named as `naming.md` settles. It lands only after S2 (see the order finding below). | Improve | T82, moved to release/C18 |
| S3 | Observation: the stable name on real pull requests into a collector and into `main`, a merge group on a scratch target, one FAIL on a throwaway pull request that adds a known-vulnerable dependency. The replay compares the new outcomes with the old job's last runs. | Evidence | T86 |
| S4 | The Owner's go, then the ruleset of Integration requires `analyze Vulnerabilities (Integration)`, after A1, A2, A3 and A5. The ruleset of Promotion requires `analyze Vulnerabilities (Promotion)` only after A4. Only the context is added, and exports before and after differ by that one line each (`ruleset-needs.json`). | Enhance | T84 |
| S5 | `dependency-review.yml` is removed, once S3 holds. It does not wait for S4: the old job is bound nowhere, so removing it reduces nothing. The uncovered-gate line of `engineering/controls/README.md` is edited. | Terminate | T85 |

The Cases are renamed to `.test.mjs` and listed in Engineering CI in the Change that makes them green, which is also the known wiring gap of create Plan.

## Order finding

Observed locally on 11 Nov 2026 with `kaal-guard verify` of this repository. A `runs: [ci]` declaration that no workflow job runs fails `verify` (`no workflow job declares it in Guard's declared form`), and `verify` is what the required `Guard` job runs. So the declaration cannot land first: it would fail the required `Guard` check on every pull request into the collector. It cannot land in the same Change as the workflow either, because `.github` travels alone. So the workflow lands first, and its job, which runs the check before the declaration exists, is not required and fails harmlessly until the declaration lands. A workflow whose job runs a check Guard does not know does not make `verify` fail.

## Equivalence and acceptance evidence

The observations of `acceptance.md` (A1 to A6) are the equivalence and operational evidence. The interpreter's behaviors are Cases (T87 to T89). Observed results and proposed tests are kept apart there, and nothing in this PLAN is observed beyond what it states.

## Scope by place

| Place | Declared when |
| --- | --- |
| Integration | A1, A2, A3 and A5 are observed |
| Promotion | A4 is also observed. If it is not, the control is not declared there, its context is not required, and the scope is Integration alone, stated as such |
| Development OUT | not realized by this Change |

## Fallback

Until S5 a step is undone by reverting its Change, and the old job has not stopped. The ruleset step is undone by restoring the exported before-state, which only removes the added context.

## Acceptance of the DO

T72 to T90 green, A1 to A5 observed (A4 may be reported as not observed, with the scope above), the exports before and after differing by the one context per ruleset, and Engineering CI running the Cases.

## Retirement of the old realization

`dependency-review.yml` is removed only when all of these hold: the new job has been observed reporting for the old job's whole scope, pull requests into `main` and into `kaal/**` (A3, A5); a vulnerable addition and an UNKNOWN have been observed (A1, A2); the DO acceptance above holds; and the Owner has accepted the evidence. A requirement in a ruleset is validated for its target separately and is not a condition of the retirement, because the old job is bound nowhere.
