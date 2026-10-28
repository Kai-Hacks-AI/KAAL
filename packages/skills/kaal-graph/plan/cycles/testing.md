# Structural Reach and Cycles: Testing

The planned tests live in `packages/skills/kaal-graph/test/plan/cycles.test.mjs`. Each title names the contracts it checks. The tests are immutable to DO and CHECK. `graph/C3` turns them GREEN and adds them to Graph's `npm test`.

| Test | Checks | Loop |
| --- | --- | --- |
| graph/T1: an acyclic structure has no cycles; a self-edge is a cycle of one | graph/F1, graph/F4 | Requirements |
| graph/T2: A1 → D1 → T2 → A1 is reported with its members sorted; two disjoint cycles are reported apart and in order; two cycles sharing a member are one component | graph/F1, graph/I1 | Intent |
| graph/T3: `reach` yields each identity once, terminates on a cycle, includes `start`, and reaches a successor that is not a key | graph/F2, graph/F4 | Requirements |
| graph/T4: `reverse` derives sorted predecessors, including for a successor that is not a key | graph/F3, graph/F4 | Requirements |
| graph/T5: the same structure in any key and successor order gives the same cycles, reach and reverse | graph/N1 | Architecture |
| graph/T6: a 100 000-member chain and a 100 000-member ring finish without exhausting the stack, and the ring is one cycle | graph/N2, graph/A2 | Architecture |
| graph/T7: the input is unchanged, the results are frozen, and a plain object works like a `Map` | graph/N3, graph/F4 | Requirements |

The following are validated by review:
- `graph/A1` and `graph/A3` are placements.
- `graph/N4` is checked by Graph's existing tests staying GREEN at `graph/C3`.

## RED evidence

At `graph/C2`, all seven tests are RED. Each is **blocked before any behavioural assertion**, because `kaal-graph` exports no `cycles`, `reach` or `reverse`. They run with `node --test packages/skills/kaal-graph/test/plan/cycles.test.mjs`, outside Graph's `npm test` until `graph/C3`.
