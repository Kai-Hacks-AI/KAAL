# C34 do

The DO of the merged PLAN (#2390).

- **Source:** `13-source/workflows/verify-workflow-names.yml`, the one job `verify Workflow names` on plain `pull_request` and `merge_group`, `contents: read`, no token and no secret. One checkout of the base commit (`pull_request.base.sha || merge_group.base_sha`) without credentials; the head fetched as a ref (`refs/pull/<n>/head`, or the queue entry's `head_ref`) and laid out with `git worktree add` in the runner's temp folder; nothing from it is executed. Step two runs release's judge from the base (exit 2 when it is absent), step three runs `judge-mode --mode ratchet` with the head's `baseline.json` as `--baseline` and the base's as `--previous`. This is the shape of `verify-triggers.yml` (judge from the base, head as Git data) with the C124 baseline contract that release confirmed.
- **Cases:** T1415 to T1417 are GREEN. I also ran the two commands by hand on a checkout of `main`: on an unchanged tree the judge writes the five known `generic-name` findings and `judge-mode` answers PASS (exit 0); with a workflow added that has no `name:`, it adds `zz-noname.yml:missing-name` and `judge-mode` answers FAIL, `new-finding` (exit 1). The job itself has not run yet.
- **What this Change does not do:** it installs nothing; `.github/workflows` is untouched and the release WIRE installs the source. No ruleset names the check and no flag is set.
- **Known property:** a pull request into a collector whose base predates release's judge gets exit 2 and a red job (the judge is absent on that base). That is why the check is not required.
- **Residual, as for C32:** a pull request can edit the workflow file itself; the Inspector closes that, and the CPO requires workflow integrity shown before the check is preventive.
