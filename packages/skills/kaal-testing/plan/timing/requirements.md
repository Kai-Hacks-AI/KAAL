# Run Timing: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **testing/F79** [testing/I21]: **Durations are given, never measured.** A run's timing is `{ cases: [{ name, ms }] }`: each case's name and its duration in milliseconds, as the harness recorded it (for example from Node's test runner). Testing reads no clock. The profile is `unknown`, with a finding for each problem and no challenge, when:
  - there is no run, or its cases are not a list;
  - a case has no name, or is named twice;
  - a duration is not a finite number of 0 or more;
  - the run has fewer cases than the minimum, 5 by default;
  - the run spent no time at all;
  - an option is unknown or out of range.

  Otherwise the profile is `challenged`, with each challenge, or `unchallenged`. The run given is not changed.
- **testing/F80** [testing/I21]: **Concentration.** Sort the cases slowest first. The slowest share is the slowest `1 − share` of the cases, rounded down to whole cases, and at least one case. The run is challenged when that slowest share took more than `budget` of the run's total time. The defaults are `share` 0.8 and `budget` 0.8: 80% of the cases must take more than 20% of the time, and equivalently the slowest 20% may take at most 80%. Exactly the budget is within it. The challenge names the cases in that share, the share of the cases they are (`caseShare`), and the share of the time they took (`timeShare`). The caller may give its own `share` and `budget`.
- **testing/F81** [testing/I21]: **Outliers.** A case is an outlier when it took more than `outlier` times the run's median case and more than `floor` milliseconds. The defaults are 10 and 1000. Exactly the multiple is within it. Each outlier challenge names the case, its `ms` and the `median`. A run whose cases are all slow alike has no outlier: it is judged against its own distribution. The caller may give its own `outlier` and `floor`.
- **testing/F82** [testing/I21]: **Platform skew.** Given one run per platform for one candidate, `{ platform, cases }` each, a case is skewed on a platform when it took more than `factor` times the median of its durations on the other platforms, and more than `floor` milliseconds. The default `factor` is 4, and exactly the factor is within it. Each skew challenge names the case, the platform, its `ms` and the other platforms' median (`others`). The skew is `unknown`, with a finding for each problem, when:
  - the runs are not a list;
  - a run names no platform, or a platform is given twice;
  - fewer than two platforms are given;
  - any platform's durations do not read under testing/F79, named with that platform;
  - the platforms' runs do not hold the same cases, naming each case and the platform it did not run on.
- **testing/F83** [testing/I21]: **A challenge is evidence, never a result.** A profile or skew is `challenged`, `unchallenged` or `unknown`, never `failed`, `verified` or `passed`. Timing does not change any run's result, a verifier's summary or parity. Each challenge states in words what it found (`statement`) and the next step it asks for (`next`), and names its `owner`:
  - `case owner` for concentration and outliers;
  - `hosting` for a platform's skew, since only Hosting owns operating-system behaviour (testing/F67).

## Nonfunctional

- **testing/N17** [testing/I21]: Profiling is pure and deterministic. It reads no clock and no host, runs nothing, keeps nothing and imports nothing. The same durations give the same result, the same challenges in the same order and the same findings, whatever order the cases or the platforms' runs were given in.
