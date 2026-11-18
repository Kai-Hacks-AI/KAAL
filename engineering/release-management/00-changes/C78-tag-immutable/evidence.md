# C78 evidence

## Provenance

- Baseline: the collector `kaal/release/stages-extra-rule` at tip 5a24cb9 (release/C70), on `main` 16a5a7d.
- Method: each Case's `run()` is imported and called in the tree of this PLAN. Observed 18 Nov 2026, Node 22 on Linux.

## Result

| Case | In the tree of this PLAN |
| --- | --- |
| release/T992 | RED: the four files are not declared (I43.md is not declared) |
| release/T993 | RED: Publishing does not declare its rule |
| release/T994 | RED: an undeclared rule is not reported as the declaration says (the declared tag rule is accepted first) |

3 RED-observed, 0 error, 0 green. The judge Cases first require the declared structure to be accepted, so their later failures are not passes by accident.

## Not shown

That each Case can go green with the drafts applied is not yet observed: the DO is where the declaration, the judge and the four files are written. The Case of the four files compares each file to its draft, so it is green exactly when the DO copies the drafts. Nothing live is claimed.

## Reproduce

```
for f in $(git ls-files -o --exclude-standard | grep 'T9.*red.mjs'); do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```

