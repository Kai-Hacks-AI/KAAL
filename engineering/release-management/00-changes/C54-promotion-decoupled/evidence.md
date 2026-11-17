# C54 evidence

## Provenance

- Baseline: the collector `kaal/release/promotion-template`. Method: each Case's `run()` is imported and called in the tree of this PLAN. Observed 17 Nov 2026, Node 24 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T710 | release/C54 | RED-observed: step 0 does not name Main requires |
| release/T711 | release/C54 | GREEN:  |

2 RED-observed, 0 error, 0 green. Each fails on its own assertion, not on a missing module.

## Can each Case pass

With the rows of `interface.md` written to `05-src/wiring/templates/promotion.md` and the Cases copied to a scratch name in a working tree: GREEN release/T710; GREEN release/T711. The edit and the copies were reverted and are not part of this PLAN.

## Reproduce

```
for f in engineering/release-management/00-changes/C54-promotion-decoupled/T*.red.mjs; do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
