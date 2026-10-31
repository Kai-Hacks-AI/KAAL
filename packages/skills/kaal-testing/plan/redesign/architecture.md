# Redesigning Slow Cases: Architecture

Each element names, in brackets, the Requirements it answers.

- **testing/A28** [testing/F93–testing/F97, testing/N20]: `kaal-testing/redesign` is one new module, `lib/redesign.mjs`, exported as `./redesign`. It imports `profile` and `DEFAULTS` from `kaal-testing/timing` (`testing/C46`) and nothing else. It exports:
  - `DEFAULTS`, frozen: `{ window: 5, recur: 3 }`;
  - `candidates(history, options?)`, which gives `{ result, candidates, refactors, unprofiled, findings }`;
  - `refactored(before, after)`, which gives `{ result, differences, findings }`.

  The export inventory row for `./redesign` (testing/A8) covers it.

## Where per-case times are kept

Testing keeps no history (testing/N15). The durable per-case times are the caller's:

| Who | Keeps or does |
| --- | --- |
| Engineering's run record (for example Guard's C129 record) | per run and platform, each Case's name, its file's `sha256` and its `ms` from Node's test runner (`duration_ms`), oldest first. Engineering calls `candidates` over that history on each lane run, and reports the candidates and refactors with the run |
| The case owner | acting on a candidate. It redesigns the Case as a REFACTOR step: a Change whose PLAN records what was learned, as testing/F74 records a lesson. It shows `refactored(...)` is `kept`, from the earlier version's RED and GREEN verdicts and the new version's verdicts on the same subjects |
| Testing | what a signal, a candidate and a refactoring are, and their defaults |

So the loop runs like this. The history shows a candidate. The owner refactors the Case and keeps its RED and GREEN verdicts. Later runs judge the new version afresh and show whether it is faster.

A Case's version is its file's bytes, so a refactoring of one Case also starts a fresh window for the other Cases in that file. That is coarse, but it never hides a slow Case: each starts again and is judged on its own later runs.

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `testing/C52` PLAN, this Change | Testing | `testing/C46` (#725) for the profile it reads |
| `testing/C53` DO: `kaal-testing/redesign`, testing/T110–testing/T115 GREEN in Testing's `npm test`, its README and docs entries | Testing | `testing/C52`, `testing/C47` |
| Engineering's run record keeps per-case `ms` and reports `candidates` | Engineering | `testing/C53` |
