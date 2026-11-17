# C12 evidence

The PLAN of C12 observes its RED against `main`. C12 cites nothing that is not on `main`.

## Provenance

- Baseline: `main` at `42e5b2aadf835c4b426292cd69c30708fa1e30bb`, which holds the finder without a `status`.
- Method: each Case's `run()` is called in the tree of this PLAN. No job executes them yet. Observed 17 Nov 2026, Node on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| T770, T771 | F19 | RED: a control with a status is refused, one without is listed |
| T772 | F20 | RED: a control with a status is not listed |
| T773 | G89 | RED: F19 is absent |
| T774 | A10 | RED: the reference shows no status line |
| T775 | I7 | RED: the command refuses a control with a status |

6 RED-observed, 0 error, 0 green. Every Case fails on its own assertion, not on a missing module.

## Can each Case pass

Against a throwaway copy of the package outside the repository, with the finder taking `status` as a sixth field checked against the four values and the reference showing the `status` line, T770, T771, T772, T774 and T775 were green. T773 stays red there only because F19 is not in that copy, and it is present in this PLAN. The copy is not part of this PLAN and implies no wording of the DO.

## What this shows and does not show

The Cases show that the status is declared, checked and listed, and that nothing else about the shape moved. They do not show that a status is true. No operational claim is made.

## Reproduce

```
for f in $(find packages/kaal-controls -name 'T77*.red.mjs' | sort -V); do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
