# C62 evidence

## Provenance

- Baseline: `main`. Method: each Case's `run()` is imported and called in the tree of this PLAN. Observed 17 Nov 2026, Node 24 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T810 | release/C62 | RED-observed: the finder refuses a control that holds a status |
| release/T811 | release/C62 | RED-observed: the release controls declare no status |

2 RED-observed, 0 error, 0 green. Each fails on its own assertion, not on a missing module.

## Can each Case pass

With `controls/C12-status-on-main.patch` applied in a working tree (`git apply`, 33 files): GREEN release/T810 and release/T811, and every Case of release-management and of the controls package stays green. The patch was reverted and is not part of this PLAN.

## Reproduce

```
for f in engineering/release-management/00-changes/C62-control-status/T*.red.mjs; do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
