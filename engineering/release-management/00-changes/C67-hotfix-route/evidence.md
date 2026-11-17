# C67 evidence

## Provenance

- Baseline: `main` (c90b9fb).
- Method: each Case's `run()` is imported and called in the tree of this PLAN; the drafts of `interface.md` were applied to a working tree to see which Cases pass and which old Cases fail, then removed. Observed 17 Nov 2026, Node 24 on Linux.

## Result on main

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T870 | release/C67, release/D1 | RED-observed: the agreed HOTFIX route is a finding |
| release/T871 | release/C67, release/D1 | RED-observed: a HOTFIX off its route is not a FAIL naming the route |
| release/T872 | release/C67, release/D1 | RED-observed: a PROMOTION from a hotfix/ head into main is a finding |
| release/T873 | release/C67, release/D1 | RED-observed: F17 does not state the HOTFIX route |

4 RED-observed, 0 error, 0 green. Each fails on its own assertion.

## Can each Case pass

With the drafts applied to `envelope.mjs` and `F17.md` in a working tree: GREEN release/T870, T871, T872 and T873.

## Old Cases that fail with the drafts applied

Release/T161, T188, T189, T190, T191 and T192 fail, each because it asserts the old route: a HOTFIX from a hotfix/ head, the base not judged, or F17's old words. Every other Case that mentions the envelope, a HOTFIX or F17 (release-management and the packages) still passes. These six are amended in the DO.

## What this shows and does not show

The Cases show the corrected route rows and F17. They do not show that the live check accepts a real HOTFIX pull request: that follows the promotion of this Change and the installation of the check as it runs on the host.

## Reproduce

```
for f in engineering/release-management/00-changes/C67-hotfix-route/T*.red.mjs; do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
