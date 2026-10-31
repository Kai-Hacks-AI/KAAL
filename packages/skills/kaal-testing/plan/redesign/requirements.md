# Redesigning Slow Cases: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **testing/F93** [testing/I24]: **A history, as kept.** `candidates(history, options?)` reads a list of runs, oldest first, as the caller kept them. Each run is `{ platform, cases: [{ name, sha256, ms }] }`. `sha256` is the Case's version, the bytes of its file (testing/F89), and `ms` is its duration as the harness recorded it. The options are `window` (default 5) and `recur` (default 3), together with any of timing's options (testing/F79–testing/F81).
  - The result is `unknown`, with a finding for each problem and no candidate, when:
    - the history is not a list;
    - a run is not an object, names no platform, or has cases that are not a list;
    - a case has no name, is reported twice in a run, names no version, or has a duration that is not finite and 0 or more;
    - an option is unknown;
    - `window` or `recur` is not a whole number of 1 or more;
    - `recur` exceeds `window`;
    - a timing option does not read.
  - An empty history shows no candidate.
  - A run that timing cannot profile, such as one with too few cases, is listed in `unprofiled` with its findings and counts for nothing.
- **testing/F94** [testing/I24]: **A redesign candidate.** Each profiled run is profiled as testing/F80 and testing/F81 state. In that run, a Case is **signalled** when it is in a concentration challenge's slowest share and took more than timing's `floor`, or when it is an outlier. A quick Case that only fills the slowest share is not signalled.
  - For each platform, and each Case on it, the **recent runs** are the last `window` profiled runs on that platform that ran the Case's current version, its latest `sha256`.
  - The Case is a candidate when it was signalled in at least `recur` of them. The candidate holds:
    - `kind` `redesign`, `case`, `version`, `platform`;
    - `seen` and `of`, the signalled count and the recent runs;
    - `signals { concentration, outlier }`;
    - `medianMs` over the recent runs;
    - `statement`, `next` (redesign the Case, and record what was learned in the owning capability's PLAN), and `owner` `case owner`.
  - Each platform is its own distribution. Candidates are ordered by `medianMs`, most first, then by Case and platform.
  - The result is `challenged` with any candidate, otherwise `unchallenged`.
- **testing/F95** [testing/I24]: **A redesign is judged afresh, and its time is shown later.** A new version of a Case is a new subject. The runs of its earlier versions never count towards its candidacy. For each Case and platform whose current version follows an earlier one, `refactors` gives `{ case, platform, from, to, beforeMs, afterMs, runs, shown }`:
  - `beforeMs` is the median over the earlier version's last `window` runs;
  - `afterMs` is the median over the current version's recent runs, and `runs` is their number;
  - `shown` is `pending` until the new version has `recur` runs, then `faster` when `afterMs` is below `beforeMs`, else `not faster`.

  A new version that is still slow becomes a candidate again, as itself.
- **testing/F96** [testing/I24]: **RED → GREEN → REFACTOR for a Case.** `refactored(before, after)` reads two versions of a Case. Each is `{ id, version, tests, verdicts }`, where `verdicts` maps each subject the version was judged on to `pass` or `fail`. The subjects are, for example, the candidate, the code before the change and each mutant.
  - **`kept`** only when all of these hold: it is the same Case; its version changed; it tests the same targets, as a set; and on every subject the earlier version was judged on, the new version was judged too and gave the same verdict, RED where RED and GREEN where GREEN. It may also be judged on more subjects.
  - **`changed`** otherwise, with each difference named: another Case, an unchanged version, a target dropped or added, a subject not judged, or a verdict flipped.
  - **`unknown`** when either version does not read, or when the earlier version shows no discriminating RED and GREEN, because then there is no behaviour to keep.

  A redesign that a candidate asks for is complete only when it is `kept`, and its time is then shown by testing/F95.
- **testing/F97** [testing/I24]: **Evidence for the case owner, never a result.**
  - `candidates` gives `challenged`, `unchallenged` or `unknown`. `refactored` gives `kept`, `changed` or `unknown`. Neither ever gives `failed`, `verified` or `passed`, and neither changes any run's result, any verifier's summary or parity (testing/F83).
  - A candidate states no outcome, and its owner is `case owner`.
  - Which Cases are candidates, and whether a redesign is a refactoring, are derived by Testing from the history and verdicts given, never declared.

## Nonfunctional

- **testing/N20** [testing/I24]: Learning is pure and deterministic. It reads only the history and verdicts given, runs nothing, reads no clock and no host, keeps nothing and changes no input. The same history gives the same candidates, refactors and findings, in the same order, whatever order each run's cases come in. The order of the runs is the caller's, oldest first, as testing/F40 states. `kaal-testing/redesign` imports only `kaal-testing/timing`.
