# C8 evidence

The PLAN of C8 observes its RED against `main`. C8 cites nothing that is not on `main`.

## Provenance

- Baseline: `main` at `36d160e122f53a5f5fcb3c128ffd22c64ce216c1`, which holds the Skill on the four types and no control identity and no finder.
- Method: each Case's `run()` is called in the tree of this PLAN. No job executes them yet. Observed 16 Nov 2026, Node 24 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| T470, T471, T474 | F13 | RED: the finder is absent |
| T472 | F14 | RED: the finder is absent |
| T473, T475 | F15 | RED: the finder is absent |
| T476 | G4 | RED: the finder is absent (F13 is present) |
| T477 | I4 | RED: the finder is absent |
| T478 | N5 | RED: the finder is absent |
| T479 | A8 | RED: the finder is absent |

10 RED-observed, 0 error, 0 green. Every Case fails on its own assertion, not on a missing module.

## Can each Case pass, and can it fail for the right reason

- Against a throwaway reference finder outside the repository, all ten Cases were green.
- With the reference changed so that a Change id is read as a control, T472 and T477 failed. With a `tests` field allowed, T474 failed. With duplicate ids allowed, T472 failed. With `has` dropped, T470 and T478 failed.
- The reference is not part of this PLAN and implies no wording of the DO.

## What this shows and does not show

The Cases show that the shape and the listing are decided deterministically. They do not show that a control is a good control, and the finder resolves no Intent and runs no Case. No operational claim is made.

## Reproduce

```
for f in $(find packages/kaal-controls -name 'T4[7]*.red.mjs' | sort -V); do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
