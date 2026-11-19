# C14 evidence

The PLAN of C14 observes its RED against the collector of C12, whose head is `aeb9ff59f7b1204408e4e8f0228d4c469c532c3e`.

## Provenance

- Method: each Case's `run()` is called in the tree of this PLAN. No job executes them yet. Observed 18 Nov 2026, Node on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| T920 | controls/F25 | RED: a valid `stations` line fails validation, because the finder refuses it as an extra field |
| T921 | controls/F25 | RED: `registry.mjs` is absent |
| T928 | controls/A12 | RED: SKILL.md does not point at the enforcing reference |

3 RED-observed, 0 error, 0 green.

## Can each Case pass

Against a throwaway implementation in a scratch worktree, all three were green with the existing Cases of the package. In the DO the pointer line must fit the 600 words, and one word is trimmed elsewhere.

## What this shows and does not show

The Cases show the declaration, its problems and the base-only registry. They do not show any judging, signing or enforcement: those are later slices.

## Reproduce

```
for f in $(find packages/kaal-controls -name 'T92[018].red.mjs' | sort -V); do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
