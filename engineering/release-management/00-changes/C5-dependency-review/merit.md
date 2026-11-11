# C5 merit

Nothing in this control is a bad idea, so the hypothesis is Migrate + Improve + Terminate the old file. The decision is per control and per realization. No realization is kept alive for its own sake.

| Realization | Decision | Reason |
| --- | --- | --- |
| The control: Intent, Requirements, Architecture, Cases (I4, F7 to F9, A24 to A28) | Migrate | `main` holds none of them (`baseline.md`). It gets an identity and a verb that matches its class, and the uncovered gate is covered. |
| The mechanism: the pinned action | Retain | It does the judging on GitHub's Advisory Database and is pinned by SHA. Replacing it would add a custom judge and no protection. Dependabot continues to update the pin. |
| The job in `dependency-review.yml` | Improve | It gains a merge_group trigger, runs for every admitted Change without a skip, holds its severity explicitly, and reports under the stable name of F9. |
| `dependency-review.yml` itself | Terminate | Once the new realization reports on real admissions and the replay shows it agrees with the old job, the file goes in a Change of its own. Waiting for retirement is fine, but it is not prolonged by thresholds. |
| Rulesets `integration` and `promotion` | Retain | This control asks for no line in them. It is bound through the guard aggregate of its step, which is `guard Integration`'s Change and the Owner's go. `ruleset-needs.json` says so. |
| Development OUT placement | Retain as declared, not realized | An advisory local run is optional. It is declared in F8 so the place is not forgotten, and it is not built by this Change. |
| Dependabot configuration | Retain | A different control on a different set of dependencies. It is not touched. |
| `engineering/controls/README.md`, the uncovered-gate line | Terminate, after the DO | It becomes false when the gate is covered. It is edited when the DO closes, not before. |

## Guard

Guard stays the concept that connects the declared check to its places. This control is declared for each place on its own. Whether Guard can bind a check that is carried out by a GitHub action instead of a command is an open question for S1 and is observed first.

## Not decided here

- Naming. `naming.md` offers options and nothing is decided. The verb is verify, because the check judges and the aggregate makes it preventive.
- The severity the control holds. The proposal is the action's current default behavior, unchanged, so that the first verdicts equal today's.
- Whether the guard aggregates fan in by reading the check results of the head commit or by another means. It is `guard Integration`'s design.
