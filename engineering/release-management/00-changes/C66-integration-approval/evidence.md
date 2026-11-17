# C66 evidence

## Provenance

- Baseline: the collector `kaal/release/integration-approval` at `main` c90b9fb.
- Method: each Case's `run()` is imported and called in the tree of this PLAN. Observed 17 Nov 2026, Node 22 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T860 | release/CTL10 | RED: release/CTL10 is not listed |
| release/T861 | release/I36 | RED: I36.md is absent |
| release/T862 | release/CTL10 | RED: integrating.json differs from the draft |
| release/T863 | release/CTL10 | RED: the stage does not declare the approval rule |
| release/T864 | release/CTL10 | RED: CTL10.md is absent |

5 RED-observed, 0 error, 0 green. Each fails on its own assertion, not on a missing module.

## Can each Case pass

With the drafts of `interface.md` written as the DO's files (`I36.md`, `CTL10.md`, the `pull_request` rule in `integrating.json`, `alsoRules` in `stages.json`) and the five Cases renamed to `.test.mjs` in a working tree, all five were green and the finder refused nothing. In the same tree the Cases runner had 20 failures: the 12 present without this Change (the unnamed Cases of `collector-capability/00-changes/C15-collector-capability`, T268 to T279) and eight that the drafts cause: release/T481, T482, T483, T487, T511, T512, T760 and T761. They are the Cases that run the judge on the real sources, and the judge accepts only `required_status_checks` as the rule of a branch ruleset. The judge itself, run on the tree, could not read its sources in this environment, so what `verify Stages` says of the drafts is the precursor's to show. The files were moved back and removed and are not part of this PLAN.

## What this shows and does not show

The Cases show that the control and its Intent are declared in the agreed form, that the source holds one approval and the dismissal of a stale one for the three integration families with no bypass actor and the checks unchanged, that the other three rulesets stay checks-only, and that the control states its limits. They do not show that a merge is refused: that needs the Owner to load the rule and a recorded refusal (DIRT Running, then Tested). They do not show whether a bot approval is accepted, or whether the unattributed-changes setting applies on `kaal/**`: both are open in `change.md`.

## Reproduce

```
for f in engineering/release-management/04-controls/CTL10-approve-integration/T860.red.mjs engineering/release-management/01-intent/I36-integration-merge-needs-approval/T861.red.mjs engineering/release-management/00-changes/C66-integration-approval/T862.red.mjs engineering/release-management/00-changes/C66-integration-approval/T863.red.mjs engineering/release-management/04-controls/CTL10-approve-integration/T864.red.mjs; do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
