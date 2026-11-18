# C63 evidence

## Provenance

- Baseline: `main`, which holds the sources of the ACT, PROMOTION, SYNC and WIRE templates in release-management and none for HOTFIX.
- Method: each Case's `run()` is imported and called in the tree of this PLAN. Observed 17 Nov 2026, Node 24 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T830 | release/C63 | RED-observed: hotfix.md is absent from 05-src/wiring/templates |
| release/T831 | release/C63 | RED-observed: hotfix.md is absent from 05-src/wiring/templates |
| release/T832 | release/C63 | RED-observed: hotfix.md is absent from 05-src/wiring/templates |

3 RED-observed, 0 error, 0 green. Each fails on its own assertion, not on a missing module.

## Can each Case pass

With the draft of `interface.md` written to `05-src/wiring/templates/hotfix.md` in a working tree: GREEN release/T830, T831 and T832, and every other Case of release-management stays green. The file was removed again and is not part of this PLAN.

## What this shows and does not show

The Cases show that the template is the current one plus a `HOW TO WORK` chapter of the agreed format, that its rows say what a correction into a hotfix branch needs, and that no row names another process. They do not show that the envelope check accepts a body of the template: that is the WIRE's step.

## Reproduce

```
for f in engineering/release-management/00-changes/C63-hotfix-template/T*.red.mjs; do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
