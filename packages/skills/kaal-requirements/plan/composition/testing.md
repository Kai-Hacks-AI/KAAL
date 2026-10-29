# Optional Composition with Architecture: Testing

The planned outer tests will live in `packages/skills/kaal-requirements/test/plan/composition.test.mjs`, written in `requirements/C3` and turned GREEN by `requirements/C4`. Each title names the contracts it checks. They are immutable to DO and CHECK. The four states are Acceptance scenarios on the packed packages, named as `architecture/C8` names its own: alone, both present, Architecture removed (Architecture says "Requirements removed"), independent upgrade. What RED and GREEN mean, and what counts as evidence, is Testing's.

| Test | Checks | Loop |
| --- | --- | --- |
| requirements/T1: **alone.** A consumer installs and registers only `kaal-requirements`. The Engine verifies, no `Placement` is present, and every Requirement's placement reads as not assessed | requirements/I1, requirements/N2, requirements/F1 | Acceptance |
| requirements/T2: **both present.** A consumer registers both packages. A Requirement reached by a decision's `Placement` Edge reads as placed, citing that decision by name and id. A Requirement no Edge reaches reads as without architectural response. The Engine verifies | requirements/F1, requirements/F2 | Acceptance |
| requirements/T3: **Architecture removed.** The consumer from T2 removes Architecture. Requirements' Nodes are unchanged and still admitted, the Engine verifies, and placement reads as not assessed. The citation recorded in T2 still names the decision by name and id, and is read as retained, not current and not false | requirements/F3, requirements/N2 | Acceptance |
| requirements/T4: **independent upgrade.** In the consumer from T2, the Requirement is replaced by a version with another id. The decision's Edge is unchanged, `check()` reports it as naming another id, and the Requirement reads as placed against an earlier version. Upgrading Requirements alone leaves its Nodes admitted | requirements/F4, requirements/N2 | Acceptance |
| requirements/T5: `package.json` has no `dependencies`, `peerDependencies` or `optionalDependencies` naming `kaal-architecture`, and nothing it ships imports it | requirements/N1 | Requirements |
| requirements/T6: The Node `Requirements` and the README state the three placement values, that Requirements reads `Placement` and owns none, the retained citation, the earlier version, and that reading a placement transfers no ownership | requirements/F1–F5 | Requirements |

The Test Cases do not judge whether a Requirement is well stated or a placement is good, and they do not test Architecture's own behaviour. Those are the agents' and Architecture's own tests.
