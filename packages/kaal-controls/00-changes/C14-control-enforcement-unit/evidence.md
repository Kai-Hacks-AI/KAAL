# C14 evidence

The PLAN of C14 observes its RED against the collector of C12, whose head is `aeb9ff59f7b1204408e4e8f0228d4c469c532c3e`.

## Provenance

- Method: each Case's `run()` is called in the tree of this PLAN. No job executes them yet. Observed 18 Nov 2026, Node on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| T920 | controls/F25 | RED: a valid `stations` line fails validation, because the finder refuses it as an extra field |
| T921 | controls/F25 | RED: `registry.mjs` is absent |
| T922 | controls/F26 | RED: `judge.mjs` is absent |
| T923 | controls/F26 | RED: `judge.mjs` is absent |
| T924 | controls/F26 | RED: `sign.mjs` is absent |
| T925 | controls/N9 | RED: the workflow template is absent |
| T926 | controls/N9 | RED: the App manifest is absent |
| T927 | controls/F27 | RED: `engineering/controls/stations.json` is absent |
| T928 | controls/A12 | RED: SKILL.md does not point at the enforcing reference |

9 RED-observed, 0 error, 0 green. Every Case fails on its own assertion.

## Can each Case pass

Against a throwaway implementation in a scratch worktree (a finder that reads `stations`, three small scripts, the two templates, the map, one reference and the pointer lines), all nine Cases were green, and the existing Cases of the package stayed green. The throwaway is not part of this PLAN. In the DO the pointer line must fit the 600 words: with a one-line pointer on the current text it was 601, so the DO trims one word elsewhere.

## What this shows and does not show

The Cases show the declaration, the base-only registry, the verdict rules, the shape of the workflow and the manifest, and the map. They do not show that the App signs on GitHub, that a ruleset pinned to it blocks a merge, or that the key cannot be reached: those need the steps of `promotion.md` and the CPO's reading.

## Reproduce

```
for f in $(find packages/kaal-controls engineering/controls -name 'T92*.red.mjs' | sort -V); do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
