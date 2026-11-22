# C1 evidence

The PLAN of C1 observes its RED against the collector `kaal/research/rehearsal-method`, cut at `main`. The package holds no Skill or script there, so every Case fails on its first assertion. Observed 22 Nov 2026, Node 22 on Linux, each Case's `run()` called in the tree of this PLAN (no job executes them yet; Node 24 is not available to the author, and the Cases use no Node 24 feature). This is the revised PLAN after the CPO review of 22 Nov; the first version's Cases are replaced.

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

In a throwaway root outside the repository, holding this tree with `draft/skills` copied to `packages/kaal-research/skills`: T1383 to T1387 are GREEN (5 GREEN, 0 RED). The authored example (`example/RH1.md`) is listed by the finder and `well-formed` by the judgement.

## Can a Case fail for the right reason

In that copy, twenty mutants of the draft scripts, each applied alone, each killed. They cover the refusals (a path outside the folder, a skipped digest, a key after the treatment, a missing essential, each effect condition, comparison on one arm, a verdict that overstates or whose scope is wrong, a claim with nothing not shown, a run count that differs, a finder that accepts a bad verdict, an import that is not a Node built-in, a result without its form-only statement) and, as the review asked, the over-strict forms:

| Over-strict mutant | Killed by |
| --- | --- |
| `key` made an essential role | every Case (the essentials-only record is refused) |
| `favourable` needs every claim, not those it rests on | every Case (the fixture's narrow favourable verdict is refused) |
| blind scoring required of every record | every Case |
| an untreated arm required of every record | T1385 (a version comparison is refused) |

## What this shows and does not show

The Cases show that the draft finder and judgement accept the honest records the review named (unblinded, version-only, narrow favourable beside an unresolved claim, essentials only, unequal counts, one example for a real trial) and refuse the omissions, the contradictions and the claims that say more than the design allows, and run alone. They do not show that this list is what makes a trial credible, that an agent or person finds the record easy to author (one example is not a rehearsal), or that the scope ladder is the right one; those are the Owner's and the CPO's judgement and a rehearsal in the DO. The draft scripts were written by the same author as the Cases: a different reader should try to find a record the Cases accept that should not be accepted. Not run in CI by the author: the layout check and any package-level check of a package with no Skill. The example's evidence files and digests are placeholders.
