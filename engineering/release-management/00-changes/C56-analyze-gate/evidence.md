# C56 evidence

## Provenance

- Baseline: `main` at 39261fa, which holds release/CTL2 with its workflow source, and `promoting.json` requiring `verify Stages (Promoting)` only.
- Method: each Case's `run()` is imported and called in the tree of this PLAN. Observed 17 Nov 2026, Node 22 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T730 | release/CTL5 | RED: release/CTL5 is not listed |
| release/T731 | release/I30 | RED: I30.md is absent |
| release/T732 | release/CTL5 | RED: the workflow does not state severity low |
| release/T733 | release/CTL5 | RED: the promoting ruleset requires one check |
| release/T734 | release/CTL5 | RED: the promoting row does not list the check and release/CTL5 |

5 RED-observed, 0 error, 0 green. Each fails on its own assertion.

## Can each Case pass

With the drafts of `interface.md` as `CTL5.md` and `I30.md`, the settings in the workflow source, the second required check in `promoting.json` and the changed rows of `controls.md`, and the five Cases copied to `.test.mjs` in a working tree, all five were green. The same trial made six existing Cases fail, because they pin Promoting to its own check: release/T481, T483, T485, T513, T516 and T581. The DO amends them (`change.md`). The trial files were reverted and are not part of this PLAN.

## What this shows and does not show

The Cases show the control and its Intent in the agreed form, that the workflow source states its settings, and that the ruleset source requires the Promoting check. They do not show that any ruleset is loaded or that the check runs in the repository: neither is installed, so no operation is claimed.

## Reproduce

Run from the repository root; in the tree of this PLAN the Cases are RED, in the tree of the DO (the `.test.mjs` names) they are GREEN:

```
for f in engineering/release-management/04-controls/CTL5-gate-analyze-vulnerabilities/T730.red.mjs engineering/release-management/01-intent/I30-no-vulnerable-promotion/T731.red.mjs engineering/release-management/00-changes/C56-analyze-gate/T73[234].red.mjs; do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\\n')[0])}})"
done
```
