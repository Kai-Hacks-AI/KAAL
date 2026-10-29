# Project map: Testing

The planned outer tests live in `packages/skills/kaal-project/test/plan/map.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK.

The DO Change turns them GREEN, adds them to `kaal-project`'s `npm test`, and may add Code tests of its own. They give Project Plans as plain data and Change's exchange as plain data (change/F13).

| Test | Checks | Loop |
| --- | --- | --- |
| project/T1: alone, a Plan maps to its Project and Project's own relations, governs, grouped with and before, with every Change unresolved and nothing owned by Change | project/I1, project/I3, project/F2, project/F3 | Intent |
| project/T2: with Change's exchange, Depends On is Change's, qualified and sourced to the dependent's content id, and the governed Changes are resolved with their id | project/I2, project/I4, project/F3 | Intent |
| project/T3: Project's before is never a dependency, Project owns only its three relation names, and a Plan that states a dependency is a finding | project/I2, project/F1, project/F2, project/F3 | Intent |
| project/T4: the same input gives byte-identical output in any input order, and the input is unchanged | project/N1, project/I5 | Architecture |
| project/T5: a governed Change Change's exchange does not list is unresolved and reported, Change's findings pass through as Change's, and a malformed Plan member is a finding naming it | project/I3, project/F1, project/F3 | Requirements |
| project/T6: the Markdown tree renders a small composed map exactly | project/F4, project/I5 | Requirements |
| project/T7: removing Change's exchange removes every relation and finding Change owns and nothing Project owns | project/I2, project/I4 | Intent |

These are validated by review:
- `project/N2` and `project/A1`–`project/A3` are placements.
- Aligning the exchange's form with Change is a negotiation, not a test.

## RED evidence

At `project/C2`, all seven tests are RED, and each is **blocked before behavioural assertion**, because `kaal-project` exports no `./map`. They run with `node --test packages/skills/kaal-project/test/plan/map.test.mjs`, outside `kaal-project`'s `npm test` until the DO Change.

The plan is satisfiable. A throwaway reference realization, which this Change does not ship, made all seven tests GREEN locally.
