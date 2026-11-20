# C1 evidence

The PLAN of defect/C1 observes its RED against `main` at `fa07abe`. It cites nothing that is not on `main`.

## Provenance

- Method: each Test Case's `run()` is called in the tree of this PLAN. No job executes them yet. Observed 20 Nov 2026, Node 22 on Linux.

## Result

| Test Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| T1210 | I1 | RED: the Skill is absent |
| T1211 | F1 | RED: the script is absent |
| T1212 | F2 | RED: the script is absent |
| T1213 | F3 | RED: the script is absent |
| T1214 | N1 | RED: package.json is absent |

5 RED-observed, 0 error, 0 green. Every Test Case fails on its own assertion.

## Can each Test Case pass

In a throwaway root outside the repository, holding `draft/package.json` and `draft/skills/kaal-defect/` as the package, all five were green.

## What this shows and does not show

They show the verdicts (known, fixed, unknown, unregistered, invalid), that `unknown`, skipped, errored and missing results are never a proven known failure, that a verdict is evidence and not a merge decision (the script does not fail on any verdict), that the to-fix list follows the placement Architecture set and otherwise where the Defect was found, and that the package depends on nothing but Foundation and Hosting. They do not show that a real Defect fits the form, that CI can feed the results, or the shrink rule (left open).

## Reproduce

```
for f in $(find packages/kaal-defect -name 'T121*.red.mjs' | sort -V); do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\\n')[0])}})"
done
```
