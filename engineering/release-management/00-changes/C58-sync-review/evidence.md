# C58 evidence

## Provenance

- Baseline: the collector `kaal/release/sync-review` at `main` 42e5b2a.
- Method: each Case's `run()` is imported and called in the tree of this PLAN. Observed 17 Nov 2026, Node 22 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T750 | release/CTL7 | RED: release/CTL7 is not listed |
| release/T751 | release/CTL8 | RED: release/CTL8 is not listed |
| release/T752 | release/CTL9 | RED: release/CTL9 is not listed |
| release/T753 | release/I32 | RED: I32.md is absent |
| release/T754 | release/C58 | RED: verify.mjs is absent |
| release/T755 | release/C58 | RED: approve.mjs is absent |
| release/T756 | release/C58 | RED: review.mjs is absent |
| release/T757 | release/C58 | RED: the workflow source is absent |

8 RED-observed, 0 error, 0 green. Each fails on its own assertion, not on a missing module.

## Can each Case pass

With the drafts of `interface.md` written as the DO's files (I32.md and the three control items equal to their drafts, `verify.mjs`, `approve.mjs`, `review.mjs` and a workflow source of the stated shape) and the eight Cases left as they are in a working tree, all eight were green, the finder refused nothing, and release/T540 and release/T600 stayed green. The files were removed again and are not part of this PLAN.

## What this shows and does not show

The Cases show that the three controls are declared in the agreed form and found from one Intent, that `verify Sync` names each false condition and is UNKNOWN for a missing fact, that `approve Sync` approves only a passing verdict of the current head, never into `main`, and only when switched on, that `review Sync` acts once per head and only with its four actions, and that the workflow source has the stated shape. They do not show a run against a real SYNC: the facts adapter, the approval call and the review requests need the WIRE and a recorded run. They do not show whether a bot approval is accepted by the rules of `kaal/**`: that is the open gap in `change.md`.

## Reproduce

```
for f in engineering/release-management/04-controls/CTL7-verify-sync/T750.red.mjs engineering/release-management/04-controls/CTL8-approve-sync/T751.red.mjs engineering/release-management/04-controls/CTL9-review-sync/T752.red.mjs engineering/release-management/01-intent/I32-pure-sync-needs-no-review/T753.red.mjs engineering/release-management/00-changes/C58-sync-review/T754.red.mjs engineering/release-management/00-changes/C58-sync-review/T755.red.mjs engineering/release-management/00-changes/C58-sync-review/T756.red.mjs engineering/release-management/00-changes/C58-sync-review/T757.red.mjs; do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
