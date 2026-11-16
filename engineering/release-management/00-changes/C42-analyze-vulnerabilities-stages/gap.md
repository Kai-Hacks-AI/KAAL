# C42 gap

| Gap | Target artefact | Baseline | Gap |
| --- | --- | --- | --- |
| release/G69 | set 1 controls table and ruleset sources | `controls.md`, `integrating.json` and `promoting.json` list only `verify Stages` checks | the control is in no stage's row and no ruleset source requires its context |
| release/G70 | workflow source | `dependency-review.yml` runs on pull_request only, under the job name `Dependency Review`; no source reports `analyze Vulnerabilities (<Stage>)` on a pull request and a merge group | no Engineering source for the stage-named check |
| release/G71 | acceptance A4 | no real merge-queue run of the control is recorded | Promoting cannot require a check never seen on a merge group |
