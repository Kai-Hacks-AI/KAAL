# C94 evidence

Observed with Node 22.23.5 and Node 24.22.3 (the Run of Cases requires Node 24), on the collector `kaal/release/verify-hotfix` at 7712758 plus this revision of the PLAN, and on a throwaway copy of `main` at 0a9cfca.

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
- T383 first judged the whole tail of a job as script text and flagged an artifact `path: ${{ runner.temp }}` as an expression in a script; it now reads the `run:` blocks only.
- In one job the judge would have run after the Cases and the Cases, being code of the pull request, could have altered the judge or forged the runs on disk. The Cases therefore run in their own job and the judge job starts clean.

## CPO review of the PLAN (19 Nov, first revision), kept

Every reproducing Case is read, and the verdict is the report and not the job result. Both stand in this revision (T380 and T382 hold them).

## Kai's correction of the model (19 Nov)

"If the test case is on main and is red, how did it get there?" and "a finding is proven by having a test case and a defect; on the first commit it would be red on hotfix/*, on the second it might be green, but the real proof it is an issue is running it against main and hotfix/* and comparing". This revision is that model.

## Retired with this Change

release/C31 (`kaal/hotfix/defect-only-diff`, PLAN #1691 merged into it, DO #1712 closed, the branch deleted by Kai on 19 Nov) is retired in favour of this Change.
