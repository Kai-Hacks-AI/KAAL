# C11 evidence

The PLAN of C11 observes its RED against `main`. C11 cites nothing that is not on `main`.

## Provenance

- Baseline: `main` at `71394da4ccd1b915ffe8090717f3b5baabbfe871`.
- Method: each Case's `run()` is called in the tree of this PLAN. No job executes them yet. Observed 16 Nov 2026, Node 24 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| T590 | F18 | RED: the name is not scoped |
| T591 | F18 | RED: the package is not scoped |
| T592 | I6 | RED: the README title is not scoped |

3 RED-observed, 0 error, 0 green. Every Case fails on its own assertion.

## Can each Case pass

In a throwaway copy of the package outside the repository, with the name and the README title changed, all three Cases were green.

## What this shows and does not show

The Cases show that the name and the title are scoped and that the rest of `package.json` and the Skill name are kept. They do not show that the package installs from a registry: it is not published.

## Reproduce

```
for f in $(find packages/kaal-controls -name 'T59*.red.mjs' | sort -V); do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
