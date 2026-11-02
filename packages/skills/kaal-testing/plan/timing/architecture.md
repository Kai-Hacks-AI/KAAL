# Run Timing: Architecture

Each element names, in brackets, the Requirements it answers.

- **testing/A25** [testing/F79–testing/F83, testing/N17]: `kaal-testing/timing` is one new module, `lib/timing.mjs`, exported as `./timing`. It exports:
  - `DEFAULTS`, frozen: `{ share: 0.8, budget: 0.8, outlier: 10, floor: 1000, factor: 4, minimum: 5 }`;
  - `profile(run, options?)`, which gives `{ result, challenges, findings }` for one run (testing/F79–testing/F81);
  - `skew(runs, options?)`, which gives the same shape across one run per platform (testing/F82).

  A challenge is `{ kind, owner, statement, next, … }`. Its `kind` is `concentration` (with `cases`, `caseShare`, `timeShare`), `outlier` (with `case`, `ms`, `median`) or `skew` (with `case`, `platform`, `ms`, `others`). Challenges are ordered by kind, then case, then platform. The export inventory row for `./timing` (testing/A8) covers the module.

  Where the durations come from is the caller's. A publisher's harness or a lane reads them from Node's test runner (each test's `duration_ms`) or from its CI report. Engineering's lanes are the first caller: they profile each lane's run, and run `skew` over the same lane on Linux, macOS and Windows.

## Ownership

| Who | Owns |
| --- | --- |
| Testing | what concentration, outlier and skew mean, their defaults, and that a challenge is evidence, never a result |
| Each case/suite owner | investigating concentration in its own suite, and each named Case's outlier or platform skew; timing alone establishes no cause |
| Hosting | consulted for demonstrated host-specific causes; owning confirmed defects at the operating-system boundary (testing/F67), never presumed from skew alone |
| Engineering | recording durations, calling `profile` and `skew` in its lanes, and reporting the challenges |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `testing/C46` PLAN, this Change | Testing | none |
| `testing/C47` DO: `kaal-testing/timing`, testing/T92–testing/T97 GREEN in Testing's `npm test`, its README and docs entries | Testing | `testing/C46` |
| `engineering/C…`: the lanes record durations and report `profile` and `skew` challenges | Engineering | `testing/C47` |
| Guard's lane timing (C136, #709), the motivating case, is checked against `profile` and `skew` once both land | Guard | `engineering/C…` |
