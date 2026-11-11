# C5 evidence

The PLAN of C5 observes its RED against `main`. Work that is not on `main` is not delivered functionality, and C5 cites nothing that is not on `main`.

## Provenance

- Baseline: `main` at `8720c401fd6aa3ea8f78f1d2f1f3e5d8d7c2a6af`.
- Method: the fifteen Cases of this PLAN (T72 to T86) are copied over a checkout of `main` and each Case's `run()` is called, then run again in the tree of this PLAN. No job executes them yet; Engineering CI lists its files explicitly.
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
| T86 | G26 | RED: the replay is absent | RED: the same |

On `main`: 15 RED-observed. In the tree of this PLAN: 11 green (documents this PLAN adds), 4 RED-observed, which wait for the DO: the declaration (S1), the merge-group reporting (S2), the replay (S3) and the retirement (S5).

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
