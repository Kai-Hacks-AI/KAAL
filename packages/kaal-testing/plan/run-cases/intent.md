# Run Cases and report their outcomes: Intent

This is `testing/C63`, a PLAN Change. It ships no runner code and changes no Skill. `testing/C64` (DO, not yet authorized) delivers the runner and turns the planned Cases GREEN. Provisional ids: they are renumbered if the case-ownership collector (C61, C62) lands first and takes any of them.

**What is missing.** A KAAL Change is judged by how many Cases are RED before and after it: a PLAN may leave the count the same or raise it, a DO the same or lower, an ACT needs none. Today nothing in KAAL observes that count. `kaal-change` has to judge it, Guard has to enforce the registered check, and the old workaround for a RED Case, a `.red` file, only hides it from `npm test`. Both need a number to judge, and that number must come from the one place that knows how to run tests: Testing.

- **testing/I40**: Testing runs the Cases it is given and reports what it observed: how many are GREEN, RED or UNKNOWN, and each test's result, with the evidence a reader needs to trust the count (which tests, which file, which problems, which Node). It reports observations only. It never decides whether a Change is acceptable: `kaal-change` judges a count, Guard runs the registered check and the Owner decides what is enforced. A test it could not observe is UNKNOWN, a run that could not finish is incomplete, and neither is made GREEN or RED to fill a gap.

Principle: the Script verifies deterministic observations, the Skill judges. A count that hides unfinished work is worse than no count.

**Out of scope.** No verdict, no policy and no ratchet (kaal-change), no enforcement (Guard), no change to the Testing Skill, no change to existing exports, no declared per-test "expected" outcome, no publication. The whole-run timeout and the home of `compareReports` were decided at CPO review (see `architecture.md`).
