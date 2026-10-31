# Redesigning Slow Cases: Testing

The planned outer tests live in `packages/skills/kaal-testing/test/plan/redesign.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `testing/C53` turns them GREEN and adds them to Testing's `npm test`. Histories and verdicts are given as plain data, and the tests own every expected candidate, refactor and difference.

| Case | Checks | Loop |
| --- | --- | --- |
| testing/T110: a history is read only as given, oldest first, and is unknown, never unchallenged, when it cannot carry a judgement | testing/F93 | Requirements |
| testing/T111: a Case among the slowest of its run, again and again in the recent runs of its current version on a platform, is a redesign candidate on that Case | testing/F94, testing/F80, testing/F81 | Requirements |
| testing/T112: a redesign is a new version, judged afresh, and its time is shown against the earlier version's on later runs | testing/F95 | Requirements |
| testing/T113: a redesign is a refactoring only when the Case keeps its targets and its discriminating RED and GREEN verdicts | testing/F96 | Requirements |
| testing/T114: a redesign candidate and a refactoring check are evidence for the case owner, never a run's result | testing/F97, testing/F83 | Requirements |
| testing/T115: learning is pure and deterministic: the same history gives the same candidates in the same order, and a verdict's order does not matter | testing/N20 | Requirements |

## RED evidence

The tests run with `node --test packages/skills/kaal-testing/test/plan/redesign.test.mjs`, outside Testing's `npm test` until `testing/C53`. At `testing/C52`, all six are RED, each **blocked before behavioural assertion**, because kaal-testing exports no `./redesign`.

**Checked against a throwaway implementation.** A28 was implemented outside the repository, on top of the throwaway timing module that #725 was checked against. All six pass against it. All 36 mutants fail at least one test. The mutants cover:
- each default changed;
- the slowness floor on the concentrated share dropped or loosened;
- the recurrence threshold lowered;
- the window or the version filter dropped;
- only concentration or only outliers counted;
- the platforms merged;
- an unprofiled run counted;
- the order reversed or its tie-break dropped;
- the owner swapped;
- a candidate reported as `failed`;
- `pending`, `faster` or the earlier version's window misreported;
- a repeated case, a missing version, a negative duration, `recur` above the window, an unknown option, an unreadable timing option or a missing platform accepted;
- a refactoring kept without a discriminating RED or GREEN in the earlier version, for another Case, for an unchanged version, with a target dropped or added, with a subject not judged, or with a verdict flipped either way;
- differences left unordered;
- a verdict other than `pass` or `fail` accepted;
- an empty target list accepted.

testing/N20's "imports only `kaal-testing/timing`" is checked by review of `testing/C53`.
