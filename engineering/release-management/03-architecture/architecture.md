# Architecture of Release management

## Controls and their realization

| Control | Requirement | Defect | Station | Realization | Configuration | Component | Case |
| --- | --- | --- | --- | --- | --- | --- | --- |
| approve Change (F15) | F15 | release-management/D1 | collectors (Integration), in | native GitHub configuration, applied as declarative ruleset JSON | the ruleset `integration` on `kaal/**` and `kaal/**/*` | `rulesets/` | release-management/F15/T1 |

The station is the control target. A control with a native realization has no judgment code of its own; `rulesets/` holds its declarative form and the check that the configuration GitHub reports as active is the one declared.
