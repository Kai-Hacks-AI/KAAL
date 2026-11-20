# C104 evidence

## Provenance

- Baseline: `main` at 3741577 and the collector `kaal/release/accept-analyze` created there.
- Method: each Case's `run()` is imported and called in the tree of this PLAN. Observed 20 Nov 2026, Node 24 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T583 (release/C48) | release/G71 | RED: the acceptance record is absent |
| release/T1267 | release/C104 | RED: equivalence.md is absent |

2 RED-observed, 0 error, 0 green. Both fail on their own assertion, not on a missing module.

## Can each Case pass

With the two drafts of `interface.md` written as `acceptance.md` (beside T583) and `equivalence.md`, and both Cases renamed to `.test.mjs` in a working tree, both were green, and T580 to T582 of release/C48 stayed green. The files and renames were removed again and are not part of this PLAN.

## What this shows and does not show

T583 shows that the record links a real run, names the Promoting check, says it was a merge-queue run and names the integration id. T1267 shows that the equivalence statement equals its draft, that the pin it states is the pin of the analyze workflow, that the analyze workflow covers every base listed, runs in the merge queue and states severity low and scope runtime, and, while the legacy workflow exists, that it uses the same pin and covers only `main` and `kaal/**`. Neither shows that the `promoting` ruleset is loaded, nor a queue run that failed on a finding.

## Reproduce

```
for f in engineering/release-management/00-changes/C48-analyze-vulnerabilities-stages/T583.red.mjs engineering/release-management/00-changes/C104-accept-analyze/T1267.red.mjs; do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
