# C79 gap

Gap id `release/G102`.

| Target artefact | Baseline | Gap |
| --- | --- | --- |
| `C35-stages/helper.mjs`, `C70-stages-declared-rules/fixtures.mjs` | the controls and the declared rules of the stages are copied by hand | a new control or key needs a manual edit of both files, and a stale copy goes unnoticed |
| the judge Cases | positive inputs are the copies | no Case shows that the judge passes on the sources it actually judges |
| the judge Cases | negative inputs build on the copies | no Case starts from the real sources and removes a setting, forges a check or drops a control |
