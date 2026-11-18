# C65 evidence

## Provenance

- Baseline: `main` at c90b9fb.
- Method: each Case's `run()` is imported and called in the tree of this PLAN. Observed 17 Nov 2026, Node 22 on Linux.
- Scanner experiment: the draft pull request #1887 (closed, never merged) ran the repository's CodeQL workflow on five minimal workflow shapes: a write job that fetches `refs/pull/N/head` (flagged), the same job with `permissions: {}` (clean), a split with the fetch in the `permissions: {}` job and none in the write job (clean), a write job fetching by commit name (flagged), and that split with the commit-name fetch (clean).

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T850 | release/I35 | RED: I35.md is absent |
| release/T851 | release/C65 | RED: verify Sync does not hold an empty set of permissions |
| release/T852 | release/C65 | RED: verify Sync still needs the API (a pure SYNC does not pass without it) |
| release/T853 | release/C65 | RED: approve.mjs has no readVerdict |
| release/T854 | release/C65 | RED: review.mjs has no cleanVerdict |
| release/T855 | release/C65 | RED: a job that can write still reads the candidate (verify Sync) |

6 RED-observed, 0 error, 0 green. Each fails on its own assertion, not on a missing module.

## Can each Case pass

With the drafts of `interface.md` written as the DO's files (I35.md, the changes to `approve.mjs`, `cli.mjs`, `review.mjs`, the workflow source, release/I35 and the Boundary paragraphs in CTL7 and CTL8) and the six Cases left as they are, all six were green. Of the existing Cases, release/T750, T751, T759, T791 and T792 failed on those files, as `change.md` says they must, and passed once moved as described there; release/T753 to T758, T790, T793, T752, T540, T600 and T730 stayed green. The files were removed again and are not part of this PLAN.

## What this shows and does not show

The Cases show the boundary as a shape: the one job that fetches holds no token and no API, the jobs that can write never fetch or name the candidate, the verdict that crosses is read strictly and cut to plain text, and approval is attached to the head and base tip GitHub says are current. They do not run CodeQL: the experiment showed the scanner reads this shape as clean, and only CodeQL on the installed copy (the WIRE's check run) shows it for the real file.

## Reproduce

```
for f in engineering/release-management/01-intent/I35-sync-review-token-boundary/T850.red.mjs engineering/release-management/00-changes/C65-sync-split/T85{1,2,3,4,5}.red.mjs; do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
