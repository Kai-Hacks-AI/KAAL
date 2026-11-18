# C60 evidence

## Provenance

- Baseline: the collector `kaal/release/sync-refusal` at the tip 3c0b3b6 of the C58 collector (the sources of C58 and the workflow source).
- Method: each Case's `run()` is imported and called in the tree of this PLAN. Observed 17 Nov 2026, Node 22 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T790 | release/I33 | RED: I33.md is absent |
| release/T791 | release/C60 | RED: approve.mjs has no classifyRefusal |
| release/T792 | release/C60 | RED: a refused approval of a pure SYNC is put in front of a person |
| release/T793 | release/C60 | RED: settings.json is absent |

4 RED-observed, 0 error, 0 green. Each fails on its own assertion, not on a missing module.

## Can each Case pass

With the drafts of `interface.md` written as the DO's files (I33.md, the additions to `approve.mjs`, `cli.mjs`, `review.mjs`, the workflow source, `settings.json`, and release/I33 and the Settings paragraph in the two control items) and the four Cases left as they are, all four were green. In the same tree release/T750, T753, T754, T755, T756, T758, T759, T540 and T600 stayed green. T751, T752 and T757 failed, as `change.md` says they must: they assert the C58 shapes this Change changes. The files were removed again and are not part of this PLAN.

## What this shows and does not show

The Cases show that the refusal is told from every other failure by its message, that it is a named finding with exit 1 and an output, that a pure SYNC whose approval was refused reaches `review Sync` once per head, and that the settings are declared and the workflow hands the outcome on. They do not show a real refusal from GitHub: the message is the one GitHub is known to return for this setting, and the stand-in reproduces it. The first live run shows it.

## Reproduce

```
for f in engineering/release-management/01-intent/I33-refused-approval-reaches-a-person/T790.red.mjs engineering/release-management/00-changes/C60-sync-approval/T79{1,2,3}.red.mjs; do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
