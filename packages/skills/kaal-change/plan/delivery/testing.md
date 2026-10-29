# Change Nodes, Succession and Delivery: Testing

The planned outer tests live in `packages/skills/kaal-change/test/plan/delivery.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK.

The DO Change turns them GREEN, adds them to `kaal-change`'s `npm test`, and may add Code tests of its own. The tests build Change Nodes with Graph's `createNode` (change/T18 then asserts ids on them), typed by the Change Definition, with Edges of the Succeeds and Delivers Definitions. They give Testing's Case Results as plain data, in the result words of `testing/F26`.

| Test | Checks | Loop |
| --- | --- | --- |
| change/T1: a Node typed by the Change Definition is a Change under its identity, `has` it, and a malformed identity is a finding it does not have | change/I1, change/F1, change/F2, change/F5 | Intent |
| change/T2: two Change Nodes with one identity are a finding, neither is walked, and `has` is false for it | change/F2, change/F5 | Requirements |
| change/T3: a predecessor is stated by its successor alone, and the reverse is derived | change/I2, change/N2, change/F5 | Intent |
| change/T4: the transitive views follow the Edges all the way, in both directions | change/F5, change/A3 | Architecture |
| change/T5: an unresolved target and a target that is not a Change are findings | change/F4 | Requirements |
| change/T6: a target edited after it was pinned is stale, and is reported, not repaired | change/F4, change/A4 | Architecture |
| change/T7: priority, rank, order, state and delivered are not a Change Node's to hold | change/I3, change/F3, change/F6 | Intent |
| change/T8: order does not matter, other Nodes are ignored, and no Changes give an empty result | change/N1, change/I4 | Requirements |
| change/T17: under content addressing, closing a cycle edits a pinned Change, so the attempt is a stale pin and never a cycle | change/F4, change/F12, change/A4 | Architecture |
| change/T18: Nodes whose ids are not their bytes' hash can state a cycle, which is a finding naming its Changes, and the views still terminate | change/F12, change/A4 | Requirements |
| change/T19: `exchange()` is plain, sorted, deterministic data: walked Changes with resolved direct relationships and required Cases, and typed findings | change/F13, change/A9 | Architecture |
| change/T20: a Change states the Intents it delivers, and an unresolved or stale Intent is a finding | change/I9, change/N2, change/F14 | Intent |
| change/T21: a Change is satisfied only when Testing's evidence reads every required Case `passed`, and anything else is unmet under Testing's word | change/I10, change/F15, change/F16, change/A10 | Intent |
| change/T22: a satisfied Change is delivered only when every Change it succeeds is delivered, and no Case about main is implied | change/I2, change/I10, change/F17, change/A10 | Requirements |
| change/T23: a Change Node present on disk but not given is absent, and nothing in the result claims registration, admission or KAAL verification | change/N5, change/I4 | Requirements |

The following are validated by review:
- `change/A1` is a placement.
- `change/A3`'s use of Graph is reviewed at the DO Change.
- `change/A4`'s separation of pinning from immutability is a placement. Any consumer's immutability policy is the consumer's, and `assess` reports a stale pin under every policy alike (change/T6).
- `change/A10`'s trust boundary, that Change reads evidence and never runs, reads or trusts a run, is reviewed at the DO Change against its imports.

change/T17 and change/T18 replace the earlier claim that acyclicity follows from content addressing and needs no test. change/T17 establishes the invariant under Graph's actual construction. change/T18 discriminates the qualified case: a forged-id cycle that `assess` must report.

## RED evidence

At `change/C1`, all fifteen tests are RED, and each is **blocked before behavioural assertion**, because `kaal-change` exports no `./delivery` and ships no Succeeds or Delivers Definition. They run with `node --test packages/skills/kaal-change/test/plan/delivery.test.mjs`, outside `kaal-change`'s `npm test` until the DO Change.
