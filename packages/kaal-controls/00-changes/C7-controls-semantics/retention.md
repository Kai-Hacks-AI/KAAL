# C7 retention

The earlier collector, now `kaal/old/controls`, is not promoted. Its text is read for what can be reused, and nothing is copied by this PLAN. The CPO review of this PLAN narrowed it to the semantics of the four types (comment 6805089510), and corrected its placement to `packages/kaal-controls/` (comment 6805154703).

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
| It lives in `packages/kaal-controls/`, the layout of the other capabilities, developed in a collector | The CPO: the package is a fair place to develop the product capability. `engineering/controls/` stays Engineering's own tooling. |
| The first PLAN of this thread proposed a package, a seven-step procedure, verdicts, naming verbs and four places. It is replaced | The CPO review: none of these belongs to this first slice. |
| Evidence is a trial of an agent against a key, not file-presence checks | The behavior that matters is that an agent distinguishes and combines the types. |

## Deferred

| Deferred | Reason |
| --- | --- |
| A Capability Node and a Control Definition | Not in this slice. |
| Publication to npmjs, and whether the package is promoted to `main` | A separate product decision. `main` is to match what is released, and that mechanic is not C7's. |
| A verdict contract (PASS, FAIL, UNKNOWN), naming verbs by type, lifecycle placement of a control | Not in this slice. The PLANs of release management that use them keep their own text for now. |
| A step-by-step procedure for designing a control, and the traceability of a control PLAN as subject of the Skill | Not in this slice. This Change is itself traced Intent to Cases, and that is not taught by the Skill. |
| Deployment of the Skill where agents discover skills | A later, explicit Change. |
| VARISC, HAPTIC, CATCH ME IF YOU CAN, the assess suite, Guard declarations | Not needed for the four types. |
| Retiring `kaal/old/controls` | After this Change is on `main`. |
