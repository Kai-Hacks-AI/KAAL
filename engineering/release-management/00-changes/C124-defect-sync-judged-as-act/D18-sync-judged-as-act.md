# release/D18: limit Act judges a SYNC as an ACT

Owner: the release capability (the controls of the ACT, `05-src/phase`). Raised by release from two SYNC pull requests.

## Record

```json
{
  "id": "release/D18",
  "context": "release (the ACT controls, workflow controls-act, runner 05-src/phase/run-controls-act.mjs, function changedPaths; the judge limit Act)",
  "expected": "A SYNC, a pure merge of main into a collector, is judged 'not an ACT' by limit Act (applies false, PASS): what arrives from main is not a change of the pull request, so it can neither make the pull request an ACT nor put paths 'outside' the route act. The demand and verify judges, which ask limit first, then also say 'not an ACT'.",
  "observed": "limit Act answers FAIL on SYNC pull requests: 'an ACT may write only its folders and files ... these paths are outside:', listing files that arrived from main (Cases of C106, C120, C35, C56 and C66, stages.json, rulesets/*, controls-act.yml). On the same runs demand and verify answer UNKNOWN, 'the carried Changes could not be read'. Earlier SYNCs (#2272, #2273, #2276) passed only because what they brought lay outside the route act.",
  "where": "engineering/release-management/05-src/phase/run-controls-act.mjs, changedPaths: `git diff --name-only --no-renames HEAD^1 HEAD` over the merge result of the pull request, whose first parent is the collector and whose second is the SYNC head, so the diff holds everything main brought.",
  "reach": "engineering/release-management/05-src/phase/run-controls-act.mjs; the workflow controls-act reads it through all four judges",
  "status": "confirmed",
  "reproduction": "SYNC #2279 (run 44928498274) and SYNC #2280 (run 44928503067) on controls ACT. Locally: release/T1350 builds a repository, merges main into a collector with --no-ff, merges that result into the collector's earlier tip, and asks changedPaths and judgeLimitAct: FAIL, outside: .github/workflows/x.yml and 00-changes/C2/C2.md, where PASS and applies false is expected."
}
```

## What is shown, and what is not

Shown: the paths the judge reads are the paths of the whole merge result, so any SYNC that brings a path of the route act or any path outside it is judged as an ACT. The reported cause was suspected; it is confirmed by reading `changedPaths` and by T1350.

Not shown, and not decided here: how the runner is to tell what a SYNC brings from the pull request's own change (by content, per the SYNC rule: the tree and the changed paths, no history), and whether a SYNC that also carries an own change is judged on the own change. Both are the remedy's. The flags are unset, so no check is red today; the defect shows when the flag of limit, demand or verify is set to `on`.

## Case

release/T1350, a plain `.test.mjs` in this folder, RED on main. It ships with the fix and is not placed on a collector without it.
