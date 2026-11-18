# C90 gap

Gap id `release/G112`.

| Target artefact | Baseline | Gap |
| --- | --- | --- |
| release/I50 | no Intent about the trigger | nothing says a workflow must not use `pull_request_target` |
| a control for it | none | a pull request can add a workflow that uses the trigger, or raise their number, unnoticed |
| the check's source | none | no workflow source runs such a check on a pull request with no token |
| the target count | 5 | no Case asserts 0 once it is reached |
