# C61 evidence

## Provenance

- Baseline: `main`. Method: each Case's `run()` is imported and called in the tree of this PLAN. Observed 17 Nov 2026, Node 24 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T800 | release/C61 | RED-observed: the entry has no state |
| release/T801 | release/C61 | RED-observed: the entry has no candidate flag |
| release/T802 | release/C61 | RED-observed: the overview counts no empty or done branches |
| release/T803 | release/C61 | RED-observed: the place view marks no state |
| release/T804 | release/C61 | RED-observed: the reader drops `ahead` and `promoted` |

5 RED-observed, 0 error, 0 green. Each fails on its own assertion, not on a missing module.

## Can each Case pass

With the draft of `interface.md` written into `show-wip.mjs` and `read.mjs` and the Cases copied to a scratch name in a working tree: GREEN release/T800 to T804. The first trial made release/T555 fail: it pins the not-observed list of the station report, which the inventory must not change. The draft therefore leaves that list alone, and an unknown branch shows as state UNKNOWN. With that, every Case of release-management stays green. The edit and the copies were reverted and are not part of this PLAN.

## Reproduce

```
for f in engineering/release-management/00-changes/C61-show-wip-stale/T*.red.mjs; do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
