# Project map: Testing

The planned outer tests live in `packages/skills/kaal-project/test/plan/map.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK.

The DO Change turns them GREEN, adds them to `kaal-project`'s `npm test`, and may add Code tests of its own. They give Project Plans and Change's map as plain data.

| Test | Checks | Loop |
| --- | --- | --- |
| project/T1: alone, a Plan maps to its Project, governs, grouping and sequencing, all owned by Project, with every Change unresolved and no dependency | project/I1, project/I3, project/F3 | Intent |
| project/T2: with Change's map, dependency and lifecycle relations are Change's, copied unchanged, and the governed Changes are resolved | project/I2, project/I4, project/F3 | Intent |
| project/T3: sequencing is never dependency, and a Plan that states a dependency is a finding | project/I2, project/F1, project/F3 | Intent |
| project/T4: the same input gives byte-identical output in any input order, and the input is unchanged | project/N1, project/I5 | Architecture |
| project/T5: a governed Change missing from Change's map is unresolved and reported, and a malformed Plan member is a finding naming it | project/I3, project/F1, project/F3 | Requirements |
| project/T6: the Markdown tree renders a small composed map exactly | project/F4, project/I5 | Requirements |
| project/T7: removing Change's map removes every dependency relation and nothing Project owns | project/I2, project/I4 | Intent |

These are validated by review:
- `project/N2` and `project/A1`–`project/A3` are placements.
- The open decisions D1–D4 are the Owner's.

## RED evidence

At `project/C2`, all seven tests are RED, and each is **blocked before behavioural assertion**, because `kaal-project` exports no `./map`. They run with `node --test packages/skills/kaal-project/test/plan/map.test.mjs`, outside `kaal-project`'s `npm test` until the DO Change.

The plan is satisfiable. A throwaway reference realization, which this Change does not ship, made all seven tests GREEN locally.
