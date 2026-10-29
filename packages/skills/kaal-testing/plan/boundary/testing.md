# PLAN Boundary Integrity: Testing

The planned outer tests live in `packages/skills/kaal-testing/test/plan/boundary.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `testing/C12` turns them GREEN and adds them to Testing's `npm test`.

Each fixture is a case from the Guard lanes, given as a verdict either realization could report.

| Test | Checks | Loop |
| --- | --- | --- |
| testing/T20: an untouched boundary is "unchanged within the declaration", never "met", and still lists execution reproducibility and behavioural validity as unknown | testing/F22, testing/F23, testing/I8 | Intent |
| testing/T21: a changed planned test, and a file a sync re-adds beneath a declared directory (#500), are verified failures naming concern, owner, path and change | testing/F18, testing/F21 | Requirements |
| testing/T22: a lost executable mode (guard/D5) fails under a verdict that compared mode, and stays unknown under one that did not | testing/F19, testing/F21 | Requirements |
| testing/T23: an anchor read from the PR head, a missing anchor, and working-tree bytes (C57, C65) give unknown, never unchanged | testing/F20 | Requirements |
| testing/T24: an undeclared cross-Capability dependency (C56) stays unknown, and a declaration whose path leaves the repository is a verified failure | testing/F18, testing/F22 | Requirements |
| testing/T25: the same declaration and verdict give the same result from realization A and from realization B, and `boundary` imports no host module and no Sealing | testing/N6, testing/A10, testing/A11 | Architecture |

What stays validation: whether a declaration lists everything that gives its tests meaning, and whether a RED is the intended one.

## RED evidence

The tests run with `node --test packages/skills/kaal-testing/test/plan/boundary.test.mjs`, outside Testing's `npm test` until `testing/C12`. At `testing/C11`, all six are RED, blocked before behavioural assertion, because kaal-testing exports no `./boundary`.
