# No Duplicate Runs: Architecture

Each element names, in brackets, the Requirements it answers.

- **testing/A27** [testing/F89–testing/F92, testing/N19]: `kaal-testing/duplicates` is one new module, `lib/duplicates.mjs`, exported as `./duplicates`. It imports nothing. It exports `duplicates(execution)` and `schedule(requests)`. The export inventory row for `./duplicates` (testing/A8) covers it. It is independent of `kaal-testing/timing` (`testing/C46`), and it uses the same evidence vocabulary: a challenge is `challenged`/`unchallenged`/`unknown`, with `statement`, `next` and `owner`.

## Who uses it

| Who | Uses it for |
| --- | --- |
| Engineering's lanes | before a job runs, `schedule` over the suites and Cases that ask for case files, so each distinct file runs once per subject and conditions, and each asker reads that run; after it ran, `duplicates` over the runs it observed, nested ones included with `by`, as evidence on the job. How runs are observed and recorded across processes is Engineering's |
| A capability's own Cases | a Case that needs a suite's result, as guard/T98, guard/T101 and guard/T109 did, reads the execution's run instead of starting its own. A Case that still re-runs it is challenged, naming that Case |
| Testing's own `npm test` | testing/T109 holds Testing to it: no case file runs in two of its test scripts, nor twice in one |

## Evidence

- Guard, before #754 (Linux, Node 24, `node --test engineering/guard/acceptance/package.test.mjs`): 357 s, of which guard/T98 took 91 s and guard/T101 164 s. Each re-ran delivered case files the lane had already run. On Windows the Guard step took about 24 minutes. After #754: 108 s.
- With the runs that file observed, `duplicates` challenges each delivered Case of Guard, naming guard/T101 and guard/T98 as the re-runners. testing/T105 states this in miniature.

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `testing/C50` PLAN, this Change | Testing | none |
| `testing/C51` DO: `kaal-testing/duplicates`, testing/T104–testing/T109 GREEN in Testing's `npm test`, its README and docs entries | Testing | `testing/C50`, and `testing/C38` for the test scripts testing/T109 reads |
| Engineering's lane wiring of `schedule` and `duplicates` | Engineering | `testing/C51` |
