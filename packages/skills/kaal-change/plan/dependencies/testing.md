# Change Nodes and Their Dependencies: Testing

The planned outer tests live in `packages/skills/kaal-change/test/plan/dependencies.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK.

The DO Change turns them GREEN, adds them to `kaal-change`'s `npm test`, and may add Code tests of its own. The tests build Change Nodes with Graph's `createNode` (change/T18 then asserts ids on them), typed by the Change Definition, with Edges of the Depends On Definition.

| Test | Checks | Loop |
| --- | --- | --- |
| change/T1: a Node typed by the Change Definition is a Change under its identity, and a malformed identity is a finding | change/I1, change/F1, change/F2 | Intent |
| change/T2: two Change Nodes with one identity are a finding, and neither is walked | change/F2 | Requirements |
| change/T3: a dependency is stated by the dependent alone, and its reverse is derived | change/I2, change/N2, change/F5 | Intent |
| change/T4: the transitive views follow the Edges all the way, in both directions | change/F5, change/A3 | Architecture |
| change/T5: an unresolved target and a target that is not a Change are findings | change/F4 | Requirements |
| change/T6: a target edited after it was pinned is stale, and is reported, not repaired | change/F4, change/A4 | Architecture |
| change/T7: priority, rank, order and state are not a Change Node's to hold | change/I3, change/F3, change/F6 | Intent |
| change/T8: order does not matter, other Nodes are ignored, and no Changes give an empty result | change/N1, change/I4 | Requirements |
| change/T17: under content addressing, closing a cycle edits a pinned Change, so the attempt is a stale pin and never a cycle | change/F4, change/F12, change/A4 | Architecture |
| change/T18: Nodes whose ids are not their bytes' hash can state a cycle, which is a finding naming its Changes, and the views still terminate | change/F12, change/A4 | Requirements |

The following are validated by review:
- `change/A1` is a placement.
- `change/A3`'s use of Graph is reviewed at the DO Change.
- `change/A4`'s lifecycle rule (the Owner's decision A) is a policy. `assess` reports a stale pin under it as under any other (change/T6).

change/T17 and change/T18 replace the earlier claim that acyclicity follows from content addressing and needs no test. change/T17 establishes the invariant under Graph's actual construction. change/T18 discriminates the qualified case: a forged-id cycle that `assess` must report.

## RED evidence

At `change/C1`, all ten tests are RED, and each is **blocked before behavioural assertion**, because `kaal-change` exports no `./dependencies` and ships no Depends On Definition. They run with `node --test packages/skills/kaal-change/test/plan/dependencies.test.mjs`, outside `kaal-change`'s `npm test` until the DO Change.
