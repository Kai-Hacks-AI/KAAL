# C31 change

## PLAN

1. Add C31 with the gap G66 and two Cases, T292 (the judge) and T293 (the requirement text). Both are RED on `main` (`evidence.md`).
2. The judge is `judgeHotfixScope(paths)` in `05-src/plan-body/hotfix-scope.mjs`. `paths` is the list of paths a HOTFIX pull request changes. It returns `{ verdict, findings, notJudged }`.
3. Findings, from the paths alone:
   - the diff holds no Case file `T<n>.test.mjs` (the Case of the defect, GREEN after the correction; a rename from `.red.mjs` shows as the new path);
   - the diff touches more than one capability root, where a root is `packages/<name>` or `engineering/<name>`, and any other top-level path counts as a root of its own;
   - the diff is empty.
4. The verdict is FAIL with a finding and UNKNOWN without one. It is never PASS: whether the correction is minimal, and whether the Case really reproduces the defect, stay in `notJudged`, as F17 already says.
5. F16 states the rule in one sentence under Approach, and the judge is the only place the rule is coded.

## DO

1. Add `hotfix-scope.mjs` and make T292 and T293 green; rename both to `.test.mjs`.
2. Add the one F16 sentence.
3. Nothing calls the judge from the envelope check, a hook, CI or a ruleset: calling it is the Hotfix delivery path and its admission, separate Changes.

## ACT

1. A 4L retrospective in `act.md`.

## Not in this Change

The Hotfix delivery path, its base, admission of `hotfix/<name>` into `main`, the `Driven-by` agreement, wiring, hooks, CI, rulesets and promotion. No behavior of an existing check changes.

## Increment

One small PDCA step of the hotfix capability toward 0.0.1. Reaching `main` does not publish or bump a version.
