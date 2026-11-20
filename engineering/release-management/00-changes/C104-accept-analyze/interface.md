# C104 interface

Drafts as they are added in the DO. T1267 reads the draft of the equivalence statement; T583, T1268 and T1269 read the source.

## The acceptance, as source

`05-src/vulnerability-analysis/acceptance.mjs` exports `judgeAcceptance(facts, options)`, `CONTEXT` (`analyze Vulnerabilities (Promoting)`), `INTEGRATION_ID` (15368) and `MAX_AGE_DAYS` (14).

```
facts:  { run: { id, url, event, head_branch, created_at } | null, checks: [{ name, conclusion, appId }] }
result: { control, outcome: 'PASS' | 'FAIL' | 'UNKNOWN', passes, reason, run }
```

- PASS: the run is a `merge_group` run on a `gh-readonly-queue/main/` branch, newer than 14 days, and `checks` holds `CONTEXT` reported by integration 15368 with the conclusion `success` or `failure`.
- FAIL: such a run exists and does not report `CONTEXT`, or another integration reported it, or it has no verdict.
- UNKNOWN: no facts, no run, an unreadable time, a run older than 14 days, a run that is not a merge-queue run into `main`, or checks that cannot be read. UNKNOWN never passes.

`05-src/vulnerability-analysis/accept.mjs` exports `readFacts(repo, ask)` and, run as a command with `<owner/repo>`, prints the record as one JSON line and exits 0 PASS, 1 FAIL, 2 UNKNOWN.

- `readFacts` asks for the newest completed `merge_group` run of `analyze-vulnerabilities.yml` whose branch is a queue branch into `main`, then for the check runs of its commit.
- It uses GET only, through `gh api -X GET`, and writes nothing: no file and no record.

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

`engineering/release-management/05-src/vulnerability-analysis/acceptance.mjs` and `accept.mjs`, and `engineering/release-management/00-changes/C104-accept-analyze/equivalence.md`.
