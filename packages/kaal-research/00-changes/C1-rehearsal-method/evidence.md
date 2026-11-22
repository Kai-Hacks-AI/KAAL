# C1 evidence

The PLAN of C1 observes its RED against the collector `kaal/research/rehearsal-method`, cut at `main`. The package holds no Skill or script there, so every Case fails on its first assertion. Observed 22 Nov 2026, Node 22 on Linux, each Case's `run()` called in the tree of this PLAN (no job executes them yet; Node 24 is not available to the author, and the Cases use no Node 24 feature).

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| T1383 | F1 | RED: `find-rehearsals.mjs` is absent |
| T1384 | F2 | RED: `judge-rehearsal.mjs` is absent |
| T1385 | F3 | RED: `judge-rehearsal.mjs` is absent |
| T1386 | F4 | RED: `judge-rehearsal.mjs` is absent |
| T1387 | N1 | RED: the Skill scripts folder is absent |

5 RED-observed, 0 error, 0 green.

## Can each Case pass

In a throwaway root outside the repository, holding this tree with `draft/skills` copied to `packages/kaal-research/skills`: T1383 to T1387 are GREEN (5 GREEN, 0 RED).

## Can a Case fail for the right reason

In that copy, ten mutants of the draft scripts, each applied alone, each killed by the Case that owns the behaviour:

| Mutant | Killed by |
| --- | --- |
| a path outside the record's folder is accepted | T1384 |
| the digest comparison is skipped | T1384 |
| the key may be frozen after the treatment | T1385 |
| no untreated arm is required | T1385 |
| the run count may differ from the runs listed | T1385 |
| blinding may be claimed without saying how | T1385 |
| a `yes` claim on an unchecked run is accepted | T1386 |
| a favourable verdict ignores blinding and undemonstrated claims | T1386 |
| the finder accepts a verdict outside the three | T1383, T1387 |
| a script imports a package that is not a Node built-in | T1387 (and every Case, which cannot load it) |

## What this shows and does not show

The Cases show that the draft finder and judgement refuse the omissions and contradictions named in F1 to F4 and run alone. They do not show that this list is what makes a trial credible (that is the Owner's and the CRO's judgement), that the plain-text shape suits the people who will write the records, or that an agent given the Skill writes a good record. The last is a rehearsal for the DO. The draft scripts were written by the same author as the Cases; a different reader should try to find a record the Cases accept and should not be accepted. Not run in CI at this point: the layout check and any package-level check of a package with no Skill.
