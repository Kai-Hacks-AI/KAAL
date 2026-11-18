# C68 evidence

## Provenance

- Baseline: the collector `kaal/release/verify-envelope` at `main` c90b9fb.
- Method: each Case's `run()` is imported and called in the tree of this PLAN. Observed 17 Nov 2026, Node 22 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T880 | release/CTL11 | RED: release/CTL11 is not listed |
| release/T881 | release/CTL11 | RED: CTL11.md is absent |

2 RED-observed, 0 error, 0 green. Each fails on its own assertion, not on a missing module.

## Can each Case pass

With the draft of `interface.md` written as the DO's file (`CTL11.md` equal to the draft) and the two Cases renamed to `.test.mjs` in a working tree, both were green and the finder refused nothing. In the same tree the Cases runner (`engineering/cases/cases.test.mjs`) had 12 failures, all the unnamed Cases of `collector-capability/00-changes/C15-collector-capability` (T268 to T279), present without this Change. The files were moved back and removed and are not part of this PLAN.

## What this shows and does not show

The Cases show that the control is declared in the agreed form, found from one Intent with its two Cases, and that its text states the scope (the envelope, not the truth of what is written), what PASS means and does not authorize, and its three instances with their stages. They do not show that any instance exists: the interpreter, the CLI, the hook and the CI run are later Changes.

## Reproduce

```
for f in engineering/release-management/04-controls/CTL11-verify-envelope/T880.red.mjs engineering/release-management/04-controls/CTL11-verify-envelope/T881.red.mjs; do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
