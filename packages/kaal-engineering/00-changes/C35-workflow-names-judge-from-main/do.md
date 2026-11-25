# C35 do

The DO of the merged PLAN (#2417), approved by the CPO as aligned with release C132.

- **Source:** `13-source/workflows/verify-workflow-names.yml`. The one checkout is now of the default branch (`ref: ${{ github.event.repository.default_branch }}`, no credentials). The fetch step also fetches `BASE_SHA` as Git data. A new step `Take the accepted baseline` writes the base commit's CTL36 baseline with `git show "$BASE_SHA:<path>"` to `$RUNNER_TEMP/previous.json`, and where the base holds none it copies the default branch's file and prints that it did. If the default branch holds none either, the step exits 2. `judge-mode` gets `--previous "$RUNNER_TEMP/previous.json"`. The judge step is otherwise unchanged and an absent judge is still UNKNOWN.
- **Cases:** T1423, T1424 and T1425 are GREEN (RED on the source before this DO). F95's T1416 no longer pins the base checkout (T1423 does) and T1417 no longer pins the `--previous` path; F95.md says so. T1415 is unchanged and GREEN. T1425 checks `git show "$BASE_SHA:` and the CTL36 path separately, so a harmless variable rename does not break it.
- **Not run on a runner:** the Cases pin the text of the workflow, not its behaviour on a stale-collector SYNC; that is seen only after release's WIRE, as for C34.
- **What this Change does not do:** it installs nothing. `.github/workflows/verify-workflow-names.yml` is untouched; release's WIRE installs the source on Kai's go. No ruleset change.
