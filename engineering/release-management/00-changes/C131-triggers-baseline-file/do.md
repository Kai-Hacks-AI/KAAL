# C131 do

What the DO built, against the decisions of `change.md`.

## Built

- `04-controls/CTL20-gate-verify-triggers/baseline.json`: the sorted list of the five workflows that use `pull_request_target` on `main` (`change-isolation`, `lineage-synchronization`, `merge-group-admission`, `promotion-source`, `sync-review`), the list the judge derived (decision 1). T1418 requires the file to equal the findings of `.github/workflows` of the repository.
- `CTL20.md`: `baseline-source` is the path of that file. `strategy`, `owner`, `exit` and the prose are unchanged (decision 2).
- `05-src/triggers/verify-triggers.mjs`: `previous` is the baseline file of the base and `baseline` is the baseline file of the head, both read as Git data by the same reader that reads the workflows (`read` adds the file of `BASELINE`). The findings are still those of the head, and the verdict is still kaal-controls' `judge-mode --mode ratchet`. A file that is absent, not JSON, not a list or not unique in the base or the head is UNKNOWN, which never passes. The reasons now also name a name that grew the head's baseline and a stale name (decisions 3 and 4). The exit codes and the report line are unchanged. The installed workflow is untouched: it already runs the judge of the base.
- Cases T1418 to T1422 and `fixtures.mjs`.

## Equal enforcement (decision 5)

T1419 runs the way the judge answered before this Change (the base derives the baseline) next to the file path, over seven base/head pairs: a new use, a use given to a workflow, a removed use, an unchanged tree, a second use in one workflow, a workflow only on the base, and a swap. The verdict and the next baseline are the same in each. The old derived path is not kept in the source: it lives in the Case as the reference, and the judge has only the file path.

One behavior changes on purpose (decision 4, CPO approved): a pull request that removes a use must now take its name out of `baseline.json` in the same change, or the allowance is stale and it fails (T1420). Before, the base derived this for free.

## Cases changed on purpose

The judge now needs both baseline files, so a Case that built two trees of workflows must say what each side's file holds. `fixtures.mjs` gives `honest`, the files an author who keeps the baseline in step would write (the base holds its findings, the head holds the base's findings it still has), which is exactly what the judge used to derive. T1120 to T1122, T1408 and T1409 use it and keep their assertions. T1126 and T1134 seed the base with the baseline file, and in T1126 the pull request that removes a use also writes `[]`. T1411 now says the allowance is the baseline file of the base and the head's own file cannot widen it; it no longer asserts that the source never names `baseline.json`.

## Evidence for the promotion of controls' C24

The finder of controls' C24 DO (#2404, head fetched from the pull request), run with `check-controls` on `main` before this Change: `release/CTL20 designed invalid ... baseline-source is not the path of a JSON file`, CTL36 valid. Run on this branch: CTL20 valid and CTL36 valid.

## Not done here

No history file (after controls' C25), no workflow or WIRE, no ruleset change, no flag, no removal of a use of the trigger, no change to CTL36.
