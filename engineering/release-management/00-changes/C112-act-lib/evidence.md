# C112 evidence

## Provenance

- Baseline: the collector `kaal/release/act-lib` at 3d2e46b (`main`, 20 Nov 2026). Method: each Case's `run()` is called in the tree of this PLAN. For the throwaway copy: the tree of this PLAN plus the files of `limit Act` as the SYNC #2177 brings them (`judge-limit-act.mjs`, `write-map.json`, release/C110 and its elements); the library moved out of the judges as the DO is to do it; the three draft-equality assertions removed and T1299's call renamed (the accept list); I61, F87 and A77 placed from their drafts; T1310 to T1314 renamed from `.red.mjs`. Observed 20 Nov 2026, Node 22 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T1310 | release/I61, release/F87, release/A77 | RED: I61.md is absent |
| release/T1311 | release/F87 | RED: lib/tree.mjs is absent |
| release/T1312 | release/F87 | RED: lib/cases-green.mjs is absent |
| release/T1313 | release/F87 | RED: lib/write-map.mjs is absent |
| release/T1314 | release/A77 | RED: lib/ is absent |

5 RED-observed, 0 error, 0 green. The 299 Cases of the tree of this PLAN are unchanged: all pass.

## Can each Case pass

In the throwaway copy all five are green and the 309 Cases of the tree (the 299, the five of `limit Act`, the five of this Change) all pass: the existing Cases are green after the move but for the four named in the accept list, which fail before their edit for exactly the stated reason (a source differs from its draft; `judgeFinished` is no longer the judge's).

Mutations of the copy, each caught: a judge imports another judge (T1314); the library imports a judge (T1314); the tree starts a process (T1314); parked Cases ignored (T1312, and T1264, T1266, T1296, T1297, T1299); a retro read when it does not declare `reflects` (T1311, and T1266, T1297, T1299); a file matched by its prefix (T1313; the first version of the Case did not catch it, so an assertion was added).

## What this shows and does not show

That the layers can be cut without changing a verdict, a message or a command line of the three judges, that the Cases of the library judge behaviour and not text, and that the one-way layering is a Case. It does not show that the Dispatcher can call the judges or that the flag `applies` fits the result shape: those are the next Changes. The runner of the lane (`engineering/lanes/comprehensive.mjs`) was not run here for want of the built packages; the Cases of the release capability were run directly.
