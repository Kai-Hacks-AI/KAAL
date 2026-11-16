# C47 evidence

## Provenance

- Baseline: `main` at 71394da, which holds one template source in release-management, `wire.md`, and no other.
- Method: each Case's `run()` is imported and called in the tree of this PLAN. Observed 16 Nov 2026, Node 24 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T670 | release/C47 | RED: default.md is absent from 05-src/wiring/templates |
| release/T671 | release/C47 | RED: default.md is absent from 05-src/wiring/templates |
| release/T672 | release/C47 | RED: default.md is absent from 05-src/wiring/templates |

3 RED-observed, 0 error, 0 green. Each fails on its own assertion, not on a missing module.

## Can each Case pass

With the draft of `interface.md` written to `05-src/wiring/templates/default.md` and the three Cases renamed to `.test.mjs` in a working tree, all three were green. The file and the renames were reverted and are not part of this PLAN.

## What this shows and does not show

The Cases show that the template is the current one plus a `HOW TO WORK` chapter of the agreed format, and that its rows say what this type needs. They do not show that the envelope check accepts a body of the template: that is the WIRE's step, after the format rule (release/C41) and this template are on `main`.

## Reproduce

```
for f in engineering/release-management/00-changes/C47-default-template/T*.red.mjs; do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
