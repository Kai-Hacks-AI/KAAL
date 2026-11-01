# Redesigning Slow Cases: Testing

The planned outer tests live in `packages/skills/kaal-testing/test/plan/redesign.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `testing/C53` turns them GREEN and adds them to Testing's `npm test`. Histories and verdicts are given as plain data, and the tests own every expected candidate, refactor and difference.

| Case | Checks | Loop |
| --- | --- | --- |
| testing/T110: a history is read only as given, oldest first, and is unknown, never unchallenged, when it cannot carry a judgement | testing/F93 | Requirements |
| testing/T111: a Case among the slowest of its run, again and again in the recent runs of its current version on a platform, is a redesign candidate on that Case | testing/F94, testing/F80, testing/F81 | Requirements |
| testing/T112: a file hash starts a fresh window for every Case in the file, and later timing comparisons do not establish a refactoring | testing/F93, testing/F95 | Requirements |
| testing/T113: a redesign is a refactoring only when the Case keeps its targets and its discriminating RED and GREEN verdicts | testing/F96 | Requirements |
| testing/T114: timing and preservation are separate evidence for the case owner, never a run's result | testing/F95, testing/F96, testing/F97, testing/F83 | Requirements |
| testing/T115: learning is pure and deterministic: the same history gives the same candidates in the same order, and a verdict's order does not matter | testing/N20 | Requirements |

## RED evidence

The tests run with `node --test packages/skills/kaal-testing/test/plan/redesign.test.mjs`, outside Testing's `npm test` until `testing/C53`. At `testing/C52`, all six are RED, each **blocked before behavioural assertion**, because kaal-testing exports no `./redesign`.

**Original throwaway evidence (before the owner-review amendment).** At `ac0b4e4`, A28 was implemented outside the repository, on top of the throwaway timing module that #725 was checked against. The original six tests passed against it, and all 36 mutants failed at least one test. This historical evidence does not cover the assertions added below. The original mutants cover:
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

## Owner-review amendment

The amendment to `testing/C52` makes two distinctions explicit without starting `testing/C53`:

- T112 gives T9 and T10 the same file hash, then changes that hash for both while only T9 gets quicker. Both timing windows reset. T10 becomes a candidate again only after three new-version runs. Exact timing rows name no behavioural result and do not assert that either Case was refactored.
- T114 pairs a `faster` comparison with a lost RED mutant, a dropped target and missing earlier RED evidence, requiring preservation results `changed`, `changed` and `unknown` respectively. Its converse pairs `not faster` with `kept`. These additions protect the separation of timing and preservation; T113 continues to require the same targets and discriminating verdicts on the same subjects.

Verified on the amended PLAN: `node --check` accepts the test file; the explicit planned-test command still reports six failures, each blocked before behavioural assertion by `ERR_PACKAGE_PATH_NOT_EXPORTED`. This is not clean behavioural RED. `npm test -w kaal-testing` passes all 166 existing tests, with no skipped tests. The new assertions have not been exercised against a throwaway implementation or mutants; their behavioural execution remains unknown. The caller's association and presentation of timing and preservation evidence belongs to Engineering's later integration, not these pure-module tests.

`testing/C53` remains dependent on `testing/C46`/`testing/C47` (#725), with Testing deriving the signals and the case owner owning the Case's design and correction. This amendment authorizes no DO, synchronization, promotion or publication.
