# C49 evidence

## Provenance

- Baseline: the collector `kaal/release/analyze-vulnerabilities-stages` with `main` at 71394da merged in.
- Method: each Case's `run()` is imported and called in the tree of this PLAN. Observed 16 Nov 2026, Node 24 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T600 | release/CTL2 | RED: release/CTL2 is not listed |
| release/T601 | release/I4 | RED: no control has release/I4 |

2 RED-observed, 0 error, 0 green. Both fail on their own assertion, not on a missing module.

## Can each Case pass

With the draft in `interface.md` copied to `04-controls/CTL2-analyze-vulnerabilities/CTL2.md` and both Cases renamed to `.test.mjs` in a working tree, both were green. The copy and the renames were reverted and are not part of this PLAN.

## What this shows and does not show

The Cases show that the control is declared in the agreed form and found from its Intent. They do not show that the reports find vulnerabilities: that is what T580 to T583 of release/C48 are for.

## Reproduce

```
for f in engineering/release-management/04-controls/CTL2-analyze-vulnerabilities/T600.red.mjs engineering/release-management/01-intent/I4-analyze-vulnerabilities/T601.red.mjs; do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
