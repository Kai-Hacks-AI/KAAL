# C125 do

## DO

What the PLAN decided, as built. Nothing installed: the installed workflow hands no evidence, so `hold Act` stays UNKNOWN on a real ACT, reported only, until a later WIRE.

- **The judge reads the evidence as data (1, 2).** `lib/cases-green.mjs` gains `observationOf(file)`, which reads only `observed`, `evidence.revision`, `evidence.expectedRevision` and `evidence.catalog` of the file Testing's `observe` wrote. `judge-act.mjs` gains `judgeHoldWithEvidence({ changes, retros, evidence })`: no ACT to hold is a PASS that needs no evidence; evidence that is missing, not the contracted shape, or whose `revision` is absent or differs from `expectedRevision` is UNKNOWN and nothing is read from it, a RED included; a Case that applies and is RED is a FAIL even when the catalog is incomplete; a catalog whose `complete` is not exactly `true` makes the verdict UNKNOWN naming the findings and the unobservable files, so no PASS rests on it; PASS only with a complete catalog, the right revision and every applicable Case GREEN.
- **The runner passes it (1).** `run-controls-act.mjs hold` takes `--evidence <file>`; the file is read by `readEvidenceFile` in `lib/tree-facts.mjs` (the runner holds no reader, T1345): absent path gives undefined, an unreadable or unparseable file gives null, which the judge answers as not the contracted shape. No import of Testing anywhere (T1379).
- **Both quote forms (3).** `applicableCases` reads `export const id = '...'` and `"..."`; a file with neither is not a Case.
- **The pilot's Cases (4).** J1 is T1376, J2 is T1377 and J3 is T1378, each as release's own Case. M21 is pinned by J3; the answers are not rebuilt through `lib/result.mjs` (the CPO's call: a separate CTO decision).
- **Runs without evidence (5).** Unchanged until a WIRE: the installed workflow passes no `--evidence`.

### Cases

T1373 (a catalog not exactly complete gives UNKNOWN, a RED stays a FAIL, a complete catalog passes), T1374 (evidence missing, misshapen or of another revision gives UNKNOWN; no ACT to hold passes without evidence), T1375 (both quote forms), T1376 to T1378 (J1 to J3), T1379 (the file reader, no Testing import). Two mutants were tried by hand: removing the `complete` check turns T1373 red, removing the revision check turns T1374 red. The whole release-management folder has no red Case.
