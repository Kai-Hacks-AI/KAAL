# C52 evidence

## Provenance

- Baseline: the collector `kaal/release/act-template`. Method: each Case's `run()` is imported and called in the tree of this PLAN. Observed 17 Nov 2026, Node 24 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T690 | release/C52 | RED-observed: the last row does not say that the merge starts nothing |

1 RED-observed, 0 error, 0 green. Each fails on its own assertion, not on a missing module.

## Can each Case pass

With the rows of `interface.md` written to `05-src/wiring/templates/act.md` and the Cases copied to a scratch name in a working tree: GREEN release/T690. The edit and the copies were reverted and are not part of this PLAN.

## Reproduce

```
for f in engineering/release-management/00-changes/C52-act-decoupled/T*.red.mjs; do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
