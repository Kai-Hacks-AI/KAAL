# Traceable Requirements: Testing

The planned outer tests will live in `packages/skills/kaal-requirements/test/plan/traceability.test.mjs`, written in `requirements/C11` and turned GREEN by `requirements/C12`. Each title names the contracts it checks. They are immutable to DO and CHECK. What RED and GREEN mean, and what counts as evidence, is Testing's.

| Test | Checks | Loop |
| --- | --- | --- |
| requirements/T15: `Serves` is a `KAAL Definition`. It states its direction, Requirement to Intent, that it transfers no ownership, and that a trigger is not an Intent | requirements/F13 | Requirements |
| requirements/T16: a fixture Requirement Node named `sample/F1`, typed by `Requirement`, with a `Serves` Edge to a fixture Intent Node, is admitted beside Requirements' contribution. The Engine verifies, Graph's `out()` from the Requirement and `in()` to the Intent both show the Edge, and `traverse(intentId, { direction: "in" })` reaches the Requirement | requirements/F12, requirements/F13, requirements/I7 | Requirements |
| requirements/T17: after the fixture Intent changes, the same Edge is reported by `check()` as naming another id, the Engine still verifies, and the Requirement is unchanged | requirements/F14 | Requirements |
| requirements/T18: a capability whose Requirements are still bracket citations is admitted and verifies, and no `Serves` Edge is reported for it | requirements/F15, requirements/N6 | Requirements |
| requirements/T19: the Definition `Requirement` and the Capability Node state the identification rule and `Serves` | requirements/F12, requirements/F16 | Requirements |
| requirements/T20: nothing the package ships imports a module, and it has no dependencies | requirements/N5 | Architecture |

The fixture Intent Node is typed by Intent's Definition `Intent` as `kaal/intent` holds it, so `requirements/C11` and `C12` follow a SYNC that brings it, or `kaal/intent`'s promotion. The Test Cases do not judge whether a trace is right, and they do not test Engineering's isolation judgment, which is `engineering/C11`'s.
