# Redesigning Slow Cases: Intent

This is `testing/C52`, a PLAN Change. It ships no code. `testing/C53` turns its planned tests GREEN. It depends on `testing/C46` (#725), whose profile it reads run by run.

**What is missing.** Timing (`testing/C46`) challenges one run: a few Cases taking most of its time, an outlier, a platform's skew. A challenge on one run says little about the Case. Kai's question is how Testing learns from test runs which Cases are badly designed, since the slowest arguably should be redesigned. Testing holds no history (testing/N15) and reads no clock, so today it cannot tell a Case that is slow in every run from one that was slow once.

Kai also named how a redesign stays safe: RED → GREEN → REFACTOR, which holds for test cases as it does for code. A redesigned Case is a refactoring of the Case. It keeps what it checks, and that is shown by the same discriminating verdicts: RED where it was RED, GREEN where it was GREEN. Its time is then shown on later runs.

**What exists.**
- A Case's recorded version uses its entire file's bytes, as testing/F89 (`testing/C50`) states for a run. This is a conservative proxy: an edit to one Case or shared fixture resets every Case's timing window in that file, without proving that each Case changed or was refactored.
- A Run of an earlier version no longer stands for the Case (testing/F40).
- BRITTLE (testing/F72–testing/F75) holds a Case to its target, and a lesson lives in the owning capability's PLAN.
- Only Testing derives evidence about Cases, and a timing flag never changes a run's result (testing/F83).

Timing improvement and behavioural preservation are separate evidence. A faster file version does not establish a successful Case refactoring. The caller presents the timing comparison alongside a behavioural check for the same Case and version pair; absent that check, preservation remains not assessed. The case owner owns the Case's design and correction, while Testing derives the evidence.

- **testing/I24**: Testing learns from a history of runs which Cases to redesign for their time. A Case that is among the slowest of its run, again and again, in the recent runs of its current version on a platform, is a redesign candidate on that Case. A redesign is held to RED → GREEN → REFACTOR: it is a new version of the same Case with the same targets, and it gives the same verdict on every subject the earlier version was judged on. Its time is then compared with the earlier version's on later runs. The caller keeps the history. Testing reads it, keeps nothing, reads no clock and never changes a run's result.
