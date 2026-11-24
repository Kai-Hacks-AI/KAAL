# C10 evidence

The PLAN of C10 observes its RED against `main`. C10 cites nothing that is not on `main`.

## Provenance

- Baseline: `main` at `eba7de487d56556bbf54771b079aa83e6aa0dce4`, which holds the typed finder and no control item.
- Method: each Case's `run()` is called in the tree of this PLAN. No job executes them yet. Observed 16 Nov 2026, Node 24 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| T540 | release/CTL1 | RED: release/CTL1 is not listed |
| T541 | release/I27 | RED: no control has release/I27 |

2 RED-observed, 0 error, 0 green. Both fail on their own assertion, not on a missing module.

## Can each Case pass

With the draft in `interface.md` copied to `04-controls/CTL1-verify-stages/CTL1.md` in a working tree, both Cases were green. The copy was removed again and is not part of this PLAN.

## What this shows and does not show

The Cases show that the control is declared in the agreed form and found from the Intent. They do not show that `verify Stages` judges the stages correctly: that is what T480 to T487 of release/C35 are for. No operational claim is made.

## Reproduce

```
for f in engineering/release-management/04-controls/CTL1-verify-stages/T540.red.mjs engineering/release-management/01-intent/I27-stages-intact/T541.red.mjs; do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
