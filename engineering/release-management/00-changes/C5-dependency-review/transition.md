# C5 transition

How the new realization is introduced, and the old one retired, without a moment of less protection. Every step is additive until S5. The old workflow keeps running until the new one is observed. Each step is its own Change into the collector, reviewed before the next. The workflow steps carry a `.github` path and so travel alone.

## Sequence

| Step | Change | Class | Turns green |
| --- | --- | --- | --- |
| S1 | The control is declared for its places (`.kaal/config/guard/Dependency-Review.md`, `runs: [ci]`). Observation of whether Guard can bind an action-run check comes first. | Improve | T82 |
| S2 | The new realization: a workflow with the job of F9 on `pull_request` and `merge_group`, explicit severity, no skip. It runs beside the old one. | Improve | T83 |
| S3 | Observation: the stable name on real pull requests into a collector and into `main`, a merge group on a scratch target, one FAIL on a throwaway pull request that adds a known-vulnerable dependency. The replay compares the new verdicts with the old job's last runs. | Evidence | T86 |
| S4 | The Owner's go, then the rulesets: `integration` first, `promotion` second, only the context added (`ruleset-needs.json`). Exports before and after are kept, and diff to that one line each. | Enhance | T84 |
| S5 | `dependency-review.yml` is removed. The uncovered-gate line of `engineering/controls/README.md` is edited. | Terminate | T85 |

The Cases are renamed to `.test.mjs` and listed in Engineering CI in the Change that makes them green, which is also the known wiring gap of create Plan.

## Equivalence tests

- **E1, history.** The last 30 pull requests the old job judged, all success: the new job gives the same verdict for the same base and head.
- **E2, failure.** A throwaway pull request that adds a dependency with a known advisory fails in both jobs and the verdict names dependency, version, advisory and severity (F7).
- **E3, fail closed.** With the dependency data unavailable the new job does not pass (UNKNOWN). The old job's behavior in that case is recorded, not assumed.
- **E4, queue.** The merge group of a scratch promotion reports the name. If it does not, the promotion binding is not applied and is reported as not observed.

## Fallback

Until S5 a step is undone by reverting its Change and the old job has not stopped. If a ruleset binding holds up admissions that it should not, the revert of the ruleset to the exported before-state is the first action, and it only removes the added context. After S5 the old workflow returns by reverting its removal.

## Acceptance of the DO

T72 to T86 green, E1 to E4 passing or E4 reported as not observed with the promotion binding left out, the exports before and after differing by the one context each, and Engineering CI running the Cases.

## Retirement of the old realization

`dependency-review.yml` is removed when the new job has been observed (S3) and the Owner has accepted the evidence. It waits for that and for nothing else, so no control that was never required is kept alive for its own sake.
