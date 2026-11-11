# C5 merit

Nothing in this control is a bad idea, so the hypothesis is Migrate + Improve + Terminate the old file. The decision is per control and per realization. No realization is kept alive for its own sake.

| Realization | Decision | Reason |
| --- | --- | --- |
| The control: Intent, Requirements, Architecture, Cases (I4, F7 to F9, A24 to A28) | Migrate | `main` holds none of them (`baseline.md`). It gets an identity and a verb that matches its class, and the uncovered gate is covered. |
| The mechanism: the pinned action | Retain | It does the analyzing on GitHub's Advisory Database and is pinned by SHA. Replacing it would add a custom interpreter and no protection. Dependabot continues to update the pin. |
| The job in `dependency-review.yml` | Improve | It gains a merge_group trigger, runs for every admitted Change without a skip, holds its severity explicitly, and reports under the stable name of F9. |
| `dependency-review.yml` itself | Terminate | Once the new realization reports on real admissions and the replay shows it agrees with the old job, the file goes in a Change of its own. Waiting for retirement is fine, but it is not prolonged by thresholds. |
| Rulesets `integration` and `promotion` | Enhance | Neither requires a dependency check today. Each gets one required context, which only adds enforcement, on the Owner's go and in the order of `transition.md`. Everything else in both stays as it is. `ruleset-needs.json` lists it. |
| Development OUT placement | Retain as declared, not realized | An advisory local run is optional. It is declared in F8 so the place is not forgotten, and it is not built by this Change. |
| Dependabot configuration | Retain | A different control on a different set of dependencies. It is not touched. |
| `engineering/controls/README.md`, the uncovered-gate line | Terminate, after the DO | It becomes false when the gate is covered. It is edited when the DO closes, not before. |

## Guard

Guard stays the concept that connects the declared check to its places. This control is declared for each place on its own. Whether Guard can bind a check that is carried out by a GitHub action instead of a command is an open question for S1 and is observed first.

## Not decided here

- Naming. `naming.md` records the Owner's choices and the open points.
- The severity the control holds. The proposal is the action's current default behavior, unchanged, so that the first outcomes equal today's.
