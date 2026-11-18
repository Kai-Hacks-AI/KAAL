# C61 evidence

## Provenance

- Baseline: `main`. Method: each Case's `run()` is imported and called in the tree of this PLAN. Observed 17 Nov 2026, Node 24 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T800 | release/C61 | RED-observed: the entry has no state |
| release/T801 | release/C61 | RED-observed: the entry has no settled flag, so conflicting or missing evidence is not held back |
| release/T802 | release/C61 | RED-observed: the overview counts no delivered or discarded branches |
| release/T803 | release/C61 | RED-observed: the place view marks no state and there is no settled view |
| release/T804 | release/C61 | RED-observed: the reader drops `head`, `ahead` and `settled` |

5 RED-observed, 0 error, 0 green. Each fails on its own assertion, not on a missing module.

## Can each Case pass

With the draft of `interface.md` written into `show-wip.mjs` and `read.mjs` in a working tree: GREEN release/T800 to T804, and every Case of release/C39 and release/T555 stays green (the not-observed list is unchanged). The edit was reverted and is not part of this PLAN.

## Reproduce

```
for f in engineering/release-management/00-changes/C61-show-wip-settled/T*.red.mjs; do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
