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
| Engineering's run record (for example Guard's C129 record) | per run and platform, each Case's name, its file's `sha256` and its `ms` from Node's test runner (`duration_ms`), oldest first. Engineering calls `candidates` over that history on each lane run, and reports the candidates and file-version timing comparisons with the run |
| The case owner | acting on a candidate. It redesigns the Case as a REFACTOR step: a Change whose PLAN records what was learned, as testing/F74 records a lesson. It shows `refactored(...)` is `kept`, from the earlier version's RED and GREEN verdicts and the new version's verdicts on the same subjects |
| Testing | what a signal, a candidate, a timing comparison and a behavioural refactoring check mean, and their defaults. The case owner owns the Case's design and correction |

So the loop runs like this. The history shows a candidate. The owner refactors the Case and keeps its RED and GREEN verdicts. Later runs judge the new version afresh and show whether it is faster.

A Case's recorded version is a conservative proxy: the SHA-256 of the entire file's bytes. Editing one Case or a shared fixture resets the timing window for every Case in that file, including untouched Cases. This can postpone a recurring-slowness signal until enough later runs accumulate. A changed hash identifies different file bytes; it does not prove which Cases changed, or that any Case was refactored.

## Presenting timing and preservation together

`candidates(...).refactors` retains its planned field name, but every row is only a file-version timing comparison. Engineering labels it that way. Neither the row's existence nor `shown: "faster"` asserts preserved behaviour. The case owner supplies targets and RED/GREEN verdicts to `refactored(before, after)` independently.

The caller associates the two pieces of evidence by `case` = `id`, `from` = `before.version` and `to` = `after.version`, keeping the timing platform. It presents `shown` and the behavioural check's `result` side by side, without merging them into a success verdict. If that Case and version pair has no behavioural check, preservation is not assessed. No matching check is inferred from another Case in the same file.

For example, a new version can be `faster` while a formerly RED mutant turns GREEN: the timing is `faster`, the behavioural check is `changed`, and the redesign has not preserved its discrimination. A faster version with no earlier RED/GREEN evidence is `unknown` for preservation. Conversely, a `kept` check may accompany `not faster`. T112 and T114 discriminate these claims separately.

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `testing/C52` PLAN, this Change | Testing | `testing/C46` (#725) for the profile it reads |
| `testing/C53` DO: `kaal-testing/redesign`, testing/T110–testing/T115 GREEN in Testing's `npm test`, its README and docs entries | Testing | `testing/C52`, `testing/C47` |
| Engineering's run record keeps per-case `ms` and reports `candidates` | Engineering | `testing/C53` |
