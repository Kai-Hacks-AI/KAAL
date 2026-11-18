# C79 evidence

## Provenance

- Baseline: `main` 01d371b (the HOTFIX template promotion, release/C63), the tree of this PLAN.
- Method: each Case's `run()` is imported and called in the tree of this PLAN. Observed 18 Nov 2026, Node 22 on Linux.

## Result

| Case | In the tree of this PLAN |
| --- | --- |
| release/T1002 | RED: `derive.mjs` is absent |
| release/T1003 | RED: `C35-stages/helper.mjs` still holds a CONTROLS list |
| release/T1004 | RED: `derive.mjs` is absent |

3 RED-observed, 0 error, 0 green. T1002 and T1004 check that the helper exists before importing it, so their RED is an assertion and not a missing module.

## Can each Case pass

Demonstrated with a throwaway implementation, never committed: a copy of the tree of this PLAN where `derive.mjs` was written from its draft, the two `CONTROLS` lists of `C35-stages/helper.mjs` and `C70-stages-declared-rules/fixtures.mjs` were replaced by a read of the real controls, the import in `C37-developing/helper.mjs` followed, and the Cases were renamed to `.test.mjs`. In the whole Cases runner T1002, T1003 and T1004 are green: the judge passes on the real sources, and the removed setting, the forged check and the dropped control each fail naming the stage, with the unmutated copy passing.

The throwaway also showed what the DO must handle, and why it waits for release/C76, C77 and C78: release/T901, T902 and T903 (release/C70) name release/CTL10 and release/CTL12 as controls to declare, and neither is in `04-controls` on `main` yet (CTL10 is in the promotion of release/C66). With the controls derived, those three Cases fail with "traced to release/CTL10, which is not a declared control". They are positive Cases that were using a name the real tree does not hold. The DO takes the control for them from the real tree, or a Case that wants a control the tree lacks declares it itself, as a negative input. That is the migration the DO does one Case at a time. Nothing live is claimed.

## Reproduce

```
for f in $(git ls-files -o --exclude-standard | grep 'T100.*red.mjs'); do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
