# C1 evidence

The PLAN of defect/C1 observes its RED against `main` at `fa07abe`. It cites nothing that is not on `main`.

## Provenance

- Method: each Test Case's `run()` is called in the tree of this PLAN. No job executes them yet. Observed 19 Nov 2026, Node on Linux.

## Result

| Test Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| T1210 | I1 | RED: the Skill is absent |
| T1211 | F1 | RED: the Skill is absent |
| T1212 | F2 | RED: the Skill is absent |
| T1213 | F3 | RED: the check is absent |
| T1214 | N1 | RED: the Skill is absent |

5 RED-observed, 0 error, 0 green. Every Test Case fails on its own assertion.

## Can each Test Case pass

In a throwaway root outside the repository, holding `draft/package.json` and `draft/skills/kaal-defect/` as the package, all five were green.

## What this shows and does not show

They show that the Skill says what it must, points where it must, and that the check separates a proven, an unproven and an invalid Defect and ignores a `tests` list on the Defect. They do not show that the definition is right (the Owner's judgment), and they do not run any Test Case, so RED on main is not judged.

## Reproduce

```
for f in $(find packages/kaal-defect -name 'T121*.red.mjs' | sort -V); do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\\n')[0])}})"
done
```
