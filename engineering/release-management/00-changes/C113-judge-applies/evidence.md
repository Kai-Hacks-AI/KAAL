# C113 evidence

## Provenance

- Baseline: the collector `kaal/release/act-applies` at 1c64eba (`main`, 20 Nov 2026). Method: each Case's `run()` is called in the tree of this PLAN. For the throwaway copy: the tree of the collector `kaal/release/act-lib` (the library of release/C112 with the judges on it), the module `lib/result.mjs` added, the three judges and `cases-green.mjs` building their answers with it, I62, F88 and A78 placed from their drafts, T1315 to T1319 renamed from `.red.mjs`, and T1314 given the fifth layer (the accept list). Observed 20 Nov 2026, Node 22 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T1315 | release/I62, release/F88, release/A78 | RED: I62.md is absent |
| release/T1316 | release/F88, release/A78 | RED: lib/result.mjs is absent |
| release/T1317 | release/F88 | RED: hold Act answers without `applies` |
| release/T1318 | release/F88 | RED: demand Act answers without `applies` |
| release/T1319 | release/F88 | RED: limit Act answers without `applies` |

5 RED-observed, 0 error, 0 green. T1317 to T1319 run here against the judges as `main` has them, which is why they are red by the answer and not by an absent file.

## Can each Case pass

In the throwaway copy all five are green, and the 314 Cases of the tree (the 309 of the collector of the library and the five of this Change) all pass but four (T515, T517, T518, T1133) that also fail on a clean copy of the collector of the library, for the mode bits and the missing Git data of the copy and nothing of this Change.

Mutations of the copy, each caught: `hold Act` saying that no ACT to hold applies (T1317); `demand Act` saying a partial retro applies (T1318); `demand Act` saying that no retro applies (T1318); `limit Act` saying a pull request that is not an ACT applies (T1319); the answer module accepting a FAIL that does not apply (T1316); `judgedAndFine` ignoring `applies` (T1316); the UNKNOWN of the Cases state not applying (T1317).

## What this shows and does not show

That the flag can be added to every judge of the ACT without changing a verdict, a message or a command line, that its rule (false only on a PASS with nothing to judge) is observable, and that the answer module cannot be given a FAIL or UNKNOWN that does not apply. It does not show that the Dispatcher can use it, that `verify Act` carries it (its own DO), or that the final step is decided from the four answers: those are the next Changes. The lane runner was not run here for want of built packages; the Cases of the release capability were run directly.
