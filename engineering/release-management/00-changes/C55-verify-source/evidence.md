# C55 evidence

## Provenance

- Baseline: `main` at 39261fa, which holds the control shape and `release/CTL1`, and no control for the source tests.
- Method: each Case's `run()` is imported and called in the tree of this PLAN. Observed 17 Nov 2026, Node 22 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T720 | release/CTL4 | RED: release/CTL4 is not listed |
| release/T721 | release/I29 | RED: I29.md is absent |
| release/T722 | release/CTL4 | RED: judge.mjs is absent |
| release/T723 | release/CTL4 | RED: judge.mjs is absent |
| release/T724 | release/CTL4 | RED: judge.mjs is absent |

5 RED-observed, 0 error, 0 green. Each fails on its own assertion, not on a missing module.

## Can each Case pass

With the drafts of `interface.md` as `CTL4.md` and `I29.md`, a judge of the stated interface under `05-src/publishing/verify-source/` with `verify-source.json`, and the five Cases copied to `.test.mjs` in a working tree, all five were green. The files and the copies were removed and are not part of this PLAN.

## What this shows and does not show

The Cases show that the control and its Intent are declared in the agreed form, that every rule of engineering/F30 gives its named finding, that a run without a usable record is unknown and never verified, and that the judge is pure and bound to no command in its code. They do not show that a release run calls the judge: none does yet, so no operation is claimed.

## Reproduce

Run from the repository root; in the tree of this PLAN the Cases are RED, in the tree of the DO (the `.test.mjs` names) they are GREEN:

```
for f in engineering/release-management/04-controls/CTL4-verify-source/T720.red.mjs engineering/release-management/01-intent/I29-source-tested/T721.red.mjs engineering/release-management/00-changes/C55-verify-source/T72[234].red.mjs; do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\\n')[0])}})"
done
```
