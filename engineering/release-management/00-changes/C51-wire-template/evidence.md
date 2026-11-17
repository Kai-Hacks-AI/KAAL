# C51 evidence

## Provenance

- Baseline: `main` at 2bfb34b, which holds the WIRE template source `wire.md` with the chapters Source, Target and Verification.
- Method: each Case's `run()` is imported and called in the tree of this PLAN. Observed 17 Nov 2026, Node 24 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T680 | release/C51 | RED: the template differs from its draft |
| release/T681 | release/C51 | RED: the HOW TO WORK table is absent |
| release/T682 | release/C51 | RED: step 0 does not name on main |
| release/T683 | release/C51 | RED: T281 does not expect the four chapters |

4 RED-observed (T680 to T683), 0 error, 0 green. Each fails on its own assertion, not on a missing module.

## Can each Case pass

With the draft of `interface.md` written to `05-src/wiring/templates/wire.md`, the four Cases (T680 to T683) copied to `.test.mjs` in a working tree, and the expected chapters and the draft path changed in T281, all four were green. The file and the edits were reverted and are not part of this PLAN.

## What this shows and does not show

The Cases show that the template is the current WIRE template plus a `HOW TO WORK` chapter of the agreed format, that its rows say what a WIRE needs, and that T281 follows the new chapters. They do not show that the envelope check accepts a WIRE body of the template: that is the WIRE's step, after the format rule (release/C41) and this template are on `main`.

## Reproduce

```
for f in engineering/release-management/00-changes/C51-wire-template/T*.red.mjs; do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
