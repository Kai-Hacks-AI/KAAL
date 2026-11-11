# C5 evidence

The PLAN of C5 observes its RED against `main`. Work that is not on `main` is not delivered functionality, and C5 cites nothing that is not on `main`.

## Provenance

- Baseline: `main` at `8720c401fd6aa3ea8f78f1d2f1f3e5d8d7c2a6af`.
- Method: the nineteen Cases of this PLAN (T72 to T90) are copied over a checkout of `main` and each Case's `run()` is called, then run again in the tree of this PLAN. No job executes them yet; Engineering CI lists its files explicitly.
- Observed 11 Nov 2026, Node 24 on Linux.

## Result

| Case | Tests | On `main` | In the tree of this PLAN |
| --- | --- | --- | --- |
| T72 to T80 | I4, F7 to F9, A24 to A28 | RED: the document is absent | green |
| T81 | G21 | RED: I4 is absent | green |
| T82 | G22 | RED: no declaration | RED: no declaration |
| T83 | G23 | RED: no merge group reports the name | RED: the same |
| T84 | G24 | RED: `ruleset-needs.json` is absent | green |
| T85 | G25 | RED: the old workflow is present | RED: the same |
| T87 to T89 | F7 behaviors | RED: the judge is absent | RED: the judge is absent |
| T90 | G27 | RED: the judge is absent | RED: the judge is absent |
| T86 | G26 | RED: the replay is absent | RED: the same |

On `main` and in the tree of this PLAN the judge is absent, so the behavioral Cases T87 to T89 and T90 are RED in both ("the judge is absent"). On `main`: all 19 RED-observed. In the tree of this PLAN: 11 green (documents this PLAN adds) and 8 RED-observed, which wait for the DO: the judge (S0), the declaration (S1), the merge-group reporting (S2), the replay (S3) and the retirement (S5). The operational observations are not Cases and none is observed yet (`acceptance.md`).

The four behavioral Cases (T87 to T90) were also run once against a throwaway reference judge outside the repository, and all four were green, so each can pass. The reference is not part of this PLAN and implies no design of the DO beyond F7.

## Reproduce

```
for f in $(find engineering/release-management -name 'T*.red.mjs' | sort -V); do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
# observations of inventory.md
gh api repos/Kai-Hacks-AI/KAAL/rulesets/24952357 --jq '[.rules[]|select(.type=="required_status_checks")|.parameters.required_status_checks[].context]'
gh api repos/Kai-Hacks-AI/KAAL/rulesets/24951062 --jq '[.rules[]|select(.type=="merge_queue" or .type=="required_status_checks")|.type]'
gh run list -R Kai-Hacks-AI/KAAL -w dependency-review.yml -L 30 --json conclusion,event
```
