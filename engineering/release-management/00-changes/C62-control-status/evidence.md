# C62 evidence

## Provenance

- Baseline: the collector `kaal/release/status-on-main` at `main` 16c54de. Method: each Case's `run()` is imported and called in the tree of this PLAN. Observed 17 Nov 2026, Node 24 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T810 | release/C62 | RED-observed: the finder refuses a control that holds a status |
| release/T811 | release/C62 | RED-observed: the release controls declare no status (CTL5 included) |

2 RED-observed, 0 error, 0 green. Each fails on its own assertion, not on a missing module.

## Can each Case pass

With `controls/C12-status-on-main.patch` applied to this tree except its six files for CTL7, CTL8 and CTL9 and their Cases (`git apply --exclude`, 27 files), `status: implemented` added by hand to release/CTL5, CTL7, CTL8 and CTL9 and the status line left out of the compared text in T730 and T750 to T752: GREEN release/T810 and release/T811, and the Cases runner has 195 passing and only the 12 failures `main` already has (the unnamed Cases of `collector-capability/00-changes/C15-collector-capability`, T268 to T279). The finder refuses nothing. The changes were reverted and are not part of this PLAN.

## Reproduce

```
for f in engineering/release-management/00-changes/C62-control-status/T*.red.mjs; do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
