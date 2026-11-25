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
| T1215 | F4 | RED: the script is absent |

6 RED-observed, 0 error, 0 green. Every Test Case fails on its own assertion.


## Can each Test Case pass

In a throwaway root outside the repository, holding `draft/package.json` and `draft/skills/kaal-defect/` as the package, all six were green.

## What this shows and does not show

They show that a Case points at a Defect with its first line (several Cases per Defect), that the inventory is discovered from the Defect records alone with no second list, that the state is derived from the records of the Cases at a revision (confirmed, answered, unknown), that stale, UNKNOWN, skipped, errored and missing results are unknown, that the unresolved list follows the addressing Architecture element or the holding context, that evidence carries no coverage metadata, and that the package depends only on Foundation and Hosting and names no layout. They do not show how Testing makes the records, how Review establishes a Defect, or any CI wiring.

## Reproduce

```
for f in $(find packages/kaal-defect -name 'T121*.red.mjs' | sort -V); do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\\n')[0])}})"
done
```
