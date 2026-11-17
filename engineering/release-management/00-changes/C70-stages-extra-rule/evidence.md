# C70 evidence

## Provenance

- Baseline: the collector `kaal/release/stages-extra-rule` at `main` c90b9fb.
- Method: each Case's `run()` is imported and called in the tree of this PLAN. Observed 17 Nov 2026, Node 22 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T900 | release/C70 | RED: the declared extra rule is not accepted (the only rule must be required_status_checks) |
| release/T901 | release/C70 | RED: the declared extra rule is not accepted |

2 RED-observed, 0 error, 0 green. Each fails on its own assertion, not on a missing module.

## Can each Case pass

With the draft of `interface.md` applied to `judge.mjs` in a working tree and the two Cases renamed to `.test.mjs`, both were green, and the Cases runner (`engineering/cases/cases.test.mjs`) showed only the 12 failures present without this Change (the unnamed Cases of `collector-capability/00-changes/C15-collector-capability`, T268 to T279): release/T481, T483, T511, T512, T760 and T761 stayed green. The judge was restored and is not part of this PLAN.

## What this shows and does not show

The Cases show that a declared second rule is accepted with its exact parameters and that every departure fails: a missing rule, an undeclared one, a changed parameter, an additional rule, a reordered pair, a declaration that is not a list, and the rule on a part of Integrating. They do not show a real source with an extra rule: no stage declares one until release/C66.

## Reproduce

```
for f in engineering/release-management/00-changes/C70-stages-extra-rule/T900.red.mjs engineering/release-management/00-changes/C70-stages-extra-rule/T901.red.mjs; do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
