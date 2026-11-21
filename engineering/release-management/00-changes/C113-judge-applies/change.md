# C113 change

## PLAN

1. Add the drafts in `interface.md`: Intent I62, Requirement F88 and Architecture A78 (the module `lib/result.mjs`, the flag `applies` and the rule for each judge).
2. Add the Cases T1315 to T1319, all RED, Given-When-Then where they judge behaviour: T1315 the elements are placed and linked; T1316 the answer module (a verdict that is not PASS, FAIL or UNKNOWN is refused, an `applies` that is not a boolean is refused, an `applies` false on a FAIL or an UNKNOWN is refused, `judgedAndFine` is true only for a PASS that applies); T1317 `hold Act` (no retro reflects a carried Change: PASS, applies false; a retro reflects it and the Cases are green: PASS, applies true; red: FAIL, true; unobserved: UNKNOWN, true; unusable input: UNKNOWN, true); T1318 `demand Act` (no retro: PASS, false; exactly one retro reflecting every carried Change: PASS, true; a partial retro, nothing due: PASS, false; two retros: FAIL, true; a Change closed without a retro: FAIL, true; cannot tell: UNKNOWN, true); T1319 `limit Act` (a pull request that touches no ACT folder: PASS, false; an ACT inside its folders: PASS, true; an ACT with a path outside: FAIL, true; unusable input: UNKNOWN, true).
3. Observe the expected RED and that each Case can pass with the DO's content (`evidence.md`).
4. The PLAN changes no judge, no declaration, no workflow, no ruleset source, no hook and nothing under `.github`.

## Ids

Change `release/C113`, Intent `release/I62`, Requirement `release/F88`, Architecture `release/A78`, Cases T1315 to T1319. No control and no gap id.

## What it does, and what it leaves alone

- **Does**: one module `lib/result.mjs` for the answer; the judges and `cases-green.mjs` build their answers with it; the flag `applies` on every answer; the rule of when it is false, stated once in F88.
- **Leaves alone**: every verdict, every message, every command line and exit code (the command lines print what they printed), the shared facts, the write map and the declared controls. The Dispatcher that asks the judges, the title and body of the PROMOTION and any workflow are the next Changes. `verify Act` (release/C111) gets the same flag in its own DO.
- **Why `demand Act` is false on a partial retro**: the final step needs exactly one ACT reflecting every carried Change. A partial retro is not an ACT that is done, even though nothing is due yet; counting it as applying would let a collector with one retro for one of two Changes look final.
- **Why FAIL and UNKNOWN always apply**: a judge that found a fault, or could not tell, is not a judge with nothing to judge, and the final step must not be reached from either.

## DO

On the merged PLAN, after the library of release/C112 is on `main` and the collector has been synchronised:

1. Add `01-intent/I62-judge-applies/I62.md`, `02-requirements/F88-judge-applies/F88.md` and `03-architecture/A78-judge-applies/A78.md` from the drafts; add `parent: release/A68` to A78 once release/C105's DO is on `main`.
2. Add `05-src/phase/lib/result.mjs`; make `cases-green.mjs`, `judge-act.mjs`, `judge-demand-act.mjs` and `judge-limit-act.mjs` build their answers with it.
3. Make the accept list below; rename T1315 to T1319 from `.red.mjs` to `.test.mjs` when green.
4. Run every Case: nothing that was green may be red.

## Accept list

- release/T1314 (the layering of the library) lists the layers the library holds; it learns the fifth, `result`, which imports nothing. Its other assertions stay.

No other existing Case reads what this Change adds.

## ACT

A 4L retrospective in the ACT before the promotion; one retro for the collector.

## Left open

- `verify Act`'s own flag (its DO), the Dispatcher switch that counts the four answers on the merged tree, and the order of those two: the Dispatcher change follows the verify Act DO so the decision can include the form check from the start.
- Whether `limit Act` should also say, in its answer, which route it judged: no other judge needs it today.
