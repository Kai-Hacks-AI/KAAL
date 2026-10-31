# Run Timing: Intent

This is `testing/C46`, a PLAN Change. It ships no code. `testing/C47` turns its planned tests GREEN.

**What is missing.** Testing judges what a run shows: outcomes, applicability, parity and coverage. It does not look at how a run spends its time, so a structural issue that shows up only as time goes unchallenged. Guard's Windows lane is the motivating evidence. It runs for about 22 minutes, and most of that is three cases, T98, T101 and T109 in `engineering/guard/acceptance/package.test.mjs`. Guard's C136 (#709) addresses them. The issue was found by reading CI timings by hand. Nothing in Testing would have flagged it, or will flag the next one.

Kai asked for kaal-testing to challenge test runs where, for example, 80% of the cases do not run within 80% of the time, and left the design open. This PLAN reads that as a Pareto check, together with two narrower signals.

**What exists.** Testing's model reads no clock (testing/F40). Parity (testing/F56–testing/F58) compares one candidate's runs across platforms, by outcome only. Hosting alone owns operating-system behaviour (testing/F67).

- **testing/I21**: Testing challenges how a run spends its time, so that structural issues in a suite are found with Testing's own capabilities rather than by reading CI timings by hand. It reads durations a harness recorded, and challenges three shapes:
  - a few cases taking most of the run's time;
  - a case taking many times the run's own median case;
  - a case taking many times as long on one platform as on the others.

  A challenge is evidence that names who acts on it: the case owner for the first two, Hosting for a platform's slowdown. It never decides a run's result. Testing still reads no clock.
