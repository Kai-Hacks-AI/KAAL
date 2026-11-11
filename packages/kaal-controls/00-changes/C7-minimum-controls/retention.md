# C7 retention

The earlier collector, now `kaal/old/controls`, is 105 commits behind `main` and holds an earlier package in a layout `main` no longer uses. It is not promoted. Its text is read for what can be reused, and nothing is copied by this PLAN.

## Retained (the semantics, reworded in the DO)

| From `kaal/old/controls` | Why it stays |
| --- | --- |
| Class as design, distinct from assurance; the four classes | F10. A preventive design stays preventive whether or not it was observed operating. |
| Mechanism is not type; a check that reports is detective, a gate that requires it prevents | F11. Same distinction, now with enforcement named. |
| Documented is not enforced, configured is not operating, operating once is not effective | F13. |
| A preventive claim names the action, the actor or interface and the enforcement boundary; never "impossible" | F11 and the Skill. |
| Independent controls stay independent when a gate combines them | The Skill. |
| The `Control` Definition: a Node that documents one control | A6, without `Realized by`. |
| No registry, no compliance mapping, Controls executes nothing | N4. |
| Testing cited for verification, validation, findings and a clean result | N4. |

## Changed

| Change | Reason |
| --- | --- |
| Layout `packages/skills/kaal-controls/` becomes `packages/kaal-controls/` | The layout of every capability on `main`. |
| Verdicts PASS, FAIL and UNKNOWN, verbs by class and the four places are added | `main` cites them and defines none; release management needs them (C5 is the reference). |
| The `Realized by` Edge is dropped | Realization is traced through Architecture and Cases, not through a direct edge, and the Edge named a mechanism in a definition. |
| Guidance becomes seven steps, Intent to DO and evidence | Kai's handover. The old Skill taught distinctions, not a procedure. |
| Ids become `controls/I3`, `F10` and following, `A5` and following, `T8` and following | The ids `controls/C1` to `C6`, `I1`, `I2`, `F1` to `F9`, `N1` to `N3`, `A1` to `A4` and `T1` to `T7` stay with the collector, so no id is reused. |

## Deferred

| Deferred | Reason |
| --- | --- |
| VARISC, HAPTIC and CATCH ME IF YOU CAN | Mnemonics and roles; Process owns roles. None is needed to design a control. |
| The conformance suite that assesses a documented control (`assess`) | Landing plan of 8 Nov: it waits for a later version. |
| Declaring controls through Guard, a guard aggregate, any enforcement | Guard's machinery is not yet correct, and this Change enforces nothing. |
| A checker that reads a control PLAN | A later Change, once the Skill has been consumed and the Cases show what a checker must catch. |
| Migrating existing controls, completing the Controls backlog | Out of scope. C5 stays its own Change and is not implemented here. |
| Retiring the collector `kaal/old/controls` | A later ACT, after this Change is on `main`. |
