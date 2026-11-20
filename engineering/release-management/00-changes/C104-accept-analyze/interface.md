# C104 interface

Drafts as they are added in the DO. T583 and T1267 read the files they become.

## Draft of acceptance.md

````
# C48 acceptance

A real merge-queue run of `analyze Vulnerabilities (Promoting)`, recorded for release/G71.

- Run: https://github.com/Kai-Hacks-AI/KAAL/actions/runs/44716419310
- Event: merge_group (a merge queue run), for PROMOTION #2092 into `main`, merge group commit 3741577be6a6b5deff073bb834137701a6f38345, on 20 Nov 2026.
- Check runs reported by GitHub for the run: `analyze Vulnerabilities (Promoting)` succeeded; `analyze Vulnerabilities (Integrating)` was skipped, as designed for a base of `main`.
- Integration id: 15368, the GitHub Actions app, as `promoting.json` requires for the check. The check run of the job is a GitHub Actions job (job URL https://github.com/Kai-Hacks-AI/KAAL/actions/runs/44716419310/job/136220858216). The app id field itself was not readable with the tools used for this record.
- Other merge-queue runs of the same workflow on 19 and 20 Nov 2026 also succeeded (the ten latest were read; the workflow has 32 merge_group runs in all).
- Not shown: a run that failed on a finding in the queue, and that the `promoting` ruleset is loaded in GitHub.
````

## Draft of equivalence.md

````
# C104 equivalence

How release/CTL2 covers the legacy workflow `Dependency Review` (`.github/workflows/dependency-review.yml`), at `main` 3741577.

| Aspect | Dependency Review | analyze Vulnerabilities (release/CTL2) |
| --- | --- | --- |
| Mechanism | `actions/dependency-review-action` a1d282b3 (v5.0.0) | the same action at the same pin, then the interpreter that says PASS, FAIL or UNKNOWN |
| Pull requests into | `main`, `kaal/**` | `main`, `kaal/**`, `hotfix/**`, `wire/**` |
| Merge queue | not run | run (`merge_group`) |
| Severity and scope | the action's defaults | stated: severity low, scope runtime, no exemption |
| Result | the job fails on a finding | Promoting fails on a finding and on an analysis that cannot be made; Integrating is warn-only |
| Required by | no ruleset | `analyze Vulnerabilities (Promoting)` by the `promoting` ruleset source (release/CTL5), load by the Owner |

CTL2 covers every base the legacy workflow covers with the same mechanism, and more. What it does not carry over is the legacy job's name: nothing may require `Dependency Review` when the workflow goes, and that is checked at the retirement.
````

## Where they live

`engineering/release-management/00-changes/C48-analyze-vulnerabilities-stages/acceptance.md` and `engineering/release-management/00-changes/C104-accept-analyze/equivalence.md`.
