# Run Timing: Testing

The planned outer tests live in `packages/skills/kaal-testing/test/plan/timing.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `testing/C47` turns them GREEN and adds them to Testing's `npm test`. Durations are given as plain data. The tests own every expected challenge, so they never read their expectation from the implementation.

| Case | Checks | Loop |
| --- | --- | --- |
| testing/T92: a profile reads only given durations, and is unknown, never unchallenged, when they cannot carry a judgement | testing/F79 | Requirements |
| testing/T93: a run is challenged when its slowest cases take more than the budgeted share of the time, naming those cases and the shares | testing/F80 | Requirements |
| testing/T94: a case is challenged as an outlier when it takes many times the run's median case and more than the floor; a uniformly slow run is not | testing/F81 | Requirements |
| testing/T95: across platforms, a case is challenged where one platform takes many times its time on the others and more than the floor, naming the platform | testing/F82 | Requirements |
| testing/T96: a challenge is evidence of a structural issue, never a failed or verified run, and platform skew goes to the Case owner without inferring a host cause | testing/F83, testing/F67 | Requirements |
| testing/T97: profiling is pure and deterministic: the same durations give the same challenges in the same order, whatever order the cases came in | testing/N17 | Requirements |

## RED evidence

The tests run with `node --test packages/skills/kaal-testing/test/plan/timing.test.mjs`, outside Testing's `npm test` until `testing/C47`. At `testing/C46`, all six are RED, each **blocked before behavioural assertion**, because kaal-testing exports no `./timing`.

**Historical evidence before the ownership amendment.** A25 was implemented outside the repository, and all six pass against it. Of 41 mutants, 38 fail at least one test. The mutants cover:
- each default changed;
- each option's range check dropped or loosened, and an unknown option accepted;
- a duplicate name, a non-finite or negative duration, too few cases, or a run that spent no time accepted;
- the slowest share rounded up or computed without guarding floating point;
- the budget and multiple boundaries made inclusive;
- `caseShare` or `timeShare` misreported;
- the outlier or skew floor dropped;
- the mean in place of the median;
- an owner swapped;
- a repeated platform, too few platforms, a platform's unreadable durations or a case missing on a platform accepted;
- a platform's own time counted among the others;
- a challenge reported as `failed`;
- an empty next step;
- an unnamed case skipped silently;
- the option findings dropped;
- the slowest cases chosen in the wrong order.

Three mutants survive, and all are equivalent:
- dropping the `typeof` check, since `Number.isFinite` already refuses anything that is not a number;
- dropping the sort of one run's challenges, since concentration is produced before the outliers, which are produced in name order;
- keeping a case's extra keys, since only `name` and `ms` are read.

testing/N17's "imports nothing" is checked by review of `testing/C47`.

## Ownership amendment in C46 PLAN

F83, A25 and T96 now keep investigation with the Case/suite owner. Timing identifies a platform difference, not an operating-system cause. Hosting is consulted for demonstrated host-specific causes and owns confirmed operating-system-boundary defects. The earlier throwaway and 41-mutant evidence predates this amendment and does not verify its revised T96 assertion. C47 must exercise that assertion and challenge routing to Hosting from skew alone. The six planned tests remain blocked before behavioural assertions by the missing `./timing` export; that is not clean behavioural RED.
