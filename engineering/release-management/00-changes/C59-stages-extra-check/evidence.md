# C59 evidence

## Provenance

- Baseline: `main`. Method: each Case's `run()` is imported and called in the tree of this PLAN. Observed 17 Nov 2026, Node 24 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T760 | release/C59 | RED-observed: the declared extra check is not accepted |
| release/T761 | release/C59 | RED-observed: the declared extra check is not accepted |

2 RED-observed, 0 error, 0 green. Each fails on its own assertion, not on a missing module.

## Can each Case pass

With the judge change of `interface.md` (`05-src/stages/judge.mjs`) and the Cases copied to a scratch name in a working tree: GREEN release/T760 and release/T761, and every other Case of release-management stays green. The edit and the copies were reverted and are not part of this PLAN. The Cases name the Change they test (release/C59), so the control test of release/CTL1 stays the only Case that lists it.

## Reproduce

```
for f in engineering/release-management/00-changes/C59-stages-extra-check/T*.red.mjs; do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
