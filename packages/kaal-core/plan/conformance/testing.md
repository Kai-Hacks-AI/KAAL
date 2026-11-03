# Installation Contract Conformance Cases: Testing

The planned outer tests live in `packages/kaal-core/test/plan/conformance.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `core/C31` DO turns them GREEN and adds them to Core's `npm test`.

| Test | Checks | Loop |
| --- | --- | --- |
| core/T68: against Core's sample contract, the cases are core/T10–core/T13 in order, and each holds with no failures | core/F62, core/F65 | Requirements |
| core/T69: the cases judge the instance they are given. Another conforming instance holds. A non-conforming one fails core/T10 by its member, and core/T11–core/T13 fail because core/T10 does. A check that refuses nothing fails core/T11–core/T13, naming each mutation it did not refuse | core/F62, core/F63 | Requirements |
| core/T70: under a check that admits an instance with no assets, the asset mutations fail as "cannot apply" by their keys, never pass, and the other mutations are still judged | core/F64 | Requirements |
| core/T71: no runtime entry point of `kaal-core` reaches `./conformance` through its imports, and `./conformance` reaches no test harness | core/N18, core/A31 | Architecture |

**Why the tests discriminate.** Each of these weaker implementations is caught:

| Implementation | Caught by |
| --- | --- |
| a case that holds without running its mutations | core/T69 |
| core/T11–core/T13 holding on a non-conforming instance | core/T69 |
| cases tied to the sample's capability, assets or catalogue | core/T69, core/T70 |
| a mutation that cannot apply counted as refused, or silently dropped | core/T70 |
| `./conformance` imported by `.` or `./installation` | core/T71 |
| `./conformance` importing `node:test` | core/T71 |

The following is validated by review: whether Engineering's per-instance tests in `engineering/C4` record each result as their own evidence, as `core/A8` requires.

## RED evidence

At `core/C31`, core/T68–core/T70 are RED, each **blocked before behavioural assertion** because kaal-core exports no `./conformance`. core/T71 is RED for the same reason: it requires `./conformance` to be exported before it can check what reaches it. This is planning evidence, not discriminating behavioural RED. The discrimination is the table above, checked against a throwaway reference implementation. The tests run with `npm run build -w kaal-core && node --test packages/kaal-core/test/plan/conformance.test.mjs`, outside Core's `npm test` until the DO.
