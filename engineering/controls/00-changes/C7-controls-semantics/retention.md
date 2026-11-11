# C7 retention

The earlier collector, now `kaal/old/controls`, is not promoted. Its text is read for what can be reused, and nothing is copied by this PLAN. The CPO review of this PLAN (comment 6805089510) narrowed it to the semantics of the four types, in Engineering.

## Retained, reworded in the DO

| From `kaal/old/controls` | Where it lands |
| --- | --- |
| The four types and what each is for | F10 |
| Type is design, distinct from assurance | F10, F12 |
| A mechanism is not a type: a check that reports is detective, a gate that requires it prevents | F11 |
| Independent controls stay independent when a gate combines them | F11 |
| Documented is not enforced, configured is not operating, operating once is not effective | F12 |
| A preventive claim names the action, the actor or interface and the enforcement boundary, never "impossible" | F12 |
| Testing is cited for verification, validation, findings and a clean result | F12, N4 |

## Changed

| Change | Reason |
| --- | --- |
| It lives in `engineering/controls/`, not in a package | Engineering is the incubator. |
| The first PLAN of this thread proposed a package, a seven-step procedure, verdicts, naming verbs and four places. It is replaced | The CPO review: none of these belongs to this first slice. |
| Evidence is a trial of an agent against a key, not file-presence checks | The behavior that matters is that an agent distinguishes and combines the types. |

## Deferred

| Deferred | Reason |
| --- | --- |
| `packages/kaal-controls/`, a Capability Node, a Control Definition | Packaging is later still. |
| A verdict contract (PASS, FAIL, UNKNOWN), naming verbs by type, lifecycle placement of a control | Not in this slice. The PLANs of release management that use them keep their own text for now. |
| A step-by-step procedure for designing a control, and the traceability of a control PLAN as subject of the Skill | Not in this slice. This Change is itself traced Intent to Cases, and that is not taught by the Skill. |
| Deployment of the Skill where agents discover skills | A later, explicit Change. |
| VARISC, HAPTIC, CATCH ME IF YOU CAN, the assess suite, Guard declarations | Not needed for the four types. |
| Retiring `kaal/old/controls` | After this Change is on `main`. |
