# C48 gap

| Gap | Target artefact | Baseline | Gap |
| --- | --- | --- | --- |
| release/G69 | set 1 controls table | `controls.md` lists only the checks the rulesets require; the control is in no stage's report | no statement that the control reports per stage as detective and is required by no ruleset |
| release/G70 | workflow source | `dependency-review.yml` runs on pull_request only, under the job name `Dependency Review`; no source reports `analyze Vulnerabilities (<Stage>)` on a pull request and a merge group | no Engineering source for the stage-named check |
| release/G71 | acceptance A4 | no real merge-queue run of the control is recorded | Promoting cannot require a check never seen on a merge group |
