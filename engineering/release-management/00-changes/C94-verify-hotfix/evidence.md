# C94 evidence

Observed with Node 24.22.3 (the Run of Cases requires it), on the collector `kaal/release/verify-hotfix` at 7712758 plus this revision of the PLAN, and on a throwaway copy of `main` at 0a9cfca.

## Expected RED (the PLAN's tree)

Each of the five Cases was run alone on the collector and fails for the reason the PLAN states:

| Case | Result |
| --- | --- |
| T380 | `the verify Hotfix judge is absent` |
| T381 | `release/CTL21 is not listed` |
| T382 | `the verify Hotfix module is absent` |
| T383 | `the workflow source is absent` |
| T384 | `the verify Hotfix module is absent` |

The `.red.mjs` files are ignored by the finders and the runner, so the tree is as green as the collector.

## Each Case can pass (throwaway copy)

In a throwaway copy of `main` (0a9cfca, which holds the Run of Cases, `npm ci --ignore-scripts` and the build of kaal-core and hosting done) with the C94 PLAN folder, the DO's files taken from the drafts in `interface.md`, the F16 pointer sentence added and T380 to T384 moved to the CTL21 folder and renamed `.test.mjs`, on Node 24.22.3: all five pass. T384 ran the real `kaal-testing run` on scratch trees. The runner on `main` alone: 277 tests, 277 pass. On the copy: 282 tests, 282 pass. No other Case is affected. On the collector itself the Run of Cases is absent, which is why a SYNC precedes the DO.

## Found while writing the PLAN

- The first draft of the workflow named `pull_request_target` in a comment. T383 refuses any mention of the trigger in the source, because a text count of the trigger is what release/CTL19 exists to avoid.
- In one job the judge would have run after the Cases, and the Cases, being code of the pull request, could have altered the judge or the runs on disk. The Cases therefore run in their own job and the judge job starts clean.
- CodeQL (`js/incomplete-multi-character-sanitization`, high) flagged an earlier draft of `defectsOf`, which removed HTML comments with a single-pass regex. The draft uses `stripComments` of `05-src/plan-body/comments.mjs`, which the envelope judge already uses.

## Reviews and corrections, in order

1. CPO review of the first PLAN: every reproducing Case is read, and the verdict is the report and not the job result. Both stand.
2. Kai (19 Nov): a RED Case cannot be on `main`; the Hotfix brings its own Defect and Case; the proof is running the Case on `main` and on the Hotfix and comparing.
3. Kai (19 Nov): the valid Hotfix is one Defect, at least one Case, RED before and GREEN after, deterministic whichever Case is run; whether a Case cheats is content for review or the Inspector; the concept compares a before and an after, branches or file locations alike; PASS is possible. That revision is that.
4. CPO review #2: the adapter must not silently use the default branch as the before tree. The identity of the affected state is now explicit (`Affected: <commit>` in the Defect chapter), verifiable (commit exists, is an ancestor of the head) and materialized exactly; the core stays a comparison of two trees. T385 runs the adapter step as written in a scratch clone and proves it, including that a moved default branch is not used.

## Retired with this Change

release/C31 (`kaal/hotfix/defect-only-diff`, PLAN #1691 merged into it, DO #1712 closed, the branch deleted by Kai on 19 Nov) is retired in favour of this Change.
