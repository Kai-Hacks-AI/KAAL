# C9 evidence

The PLAN of C9 observes its RED against `main`. C9 cites nothing that is not on `main`.

## Provenance

- Baseline: `main` at `5522db073afae248d253a9b0911bf929bd307113`, which holds the control shape and the finder without a `type`.
- Method: each Case's `run()` is called in the tree of this PLAN. No job executes them yet. Observed 16 Nov 2026, Node 24 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| T530, T531, T532 | F16 | RED: a typed control is refused, an untyped one is listed |
| T533 | F17, N6 | RED: a typed control is not listed |
| T534 | G5 | RED: F16 is absent |
| T535 | A9 | RED: the reference shows no type line |
| T536 | I5 | RED: a typed control is refused |

7 RED-observed, 0 error, 0 green. Every Case fails on its own assertion, not on a missing module.

## Can each Case pass

Against a throwaway copy of the package outside the repository, with the finder taking `type` as a fifth field checked against the four values and the reference showing the `type` line, all seven Cases were green. The copy is not part of this PLAN and implies no wording of the DO.

## What this shows and does not show

The Cases show that the type is declared, checked and listed, and that nothing else about the shape moved. They do not show that a control has the right type. No operational claim is made.

## Reproduce

```
for f in $(find packages/kaal-controls -name 'T53*.red.mjs' | sort -V); do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
