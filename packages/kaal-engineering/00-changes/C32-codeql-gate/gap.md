# C32 gap

| Gap | Target artefact | Baseline | Gap |
| --- | --- | --- | --- |
| engineering/G122 | F93 | `codeql.yml` has no source in engineering and no job after `analyze`; the expected configurations are implicit in the matrix; the ruleset rule "Code scanning results / CodeQL" can complete before every upload and stay neutral | A pull request can reach merge with a configuration unanalysed, and SECURITY.md's requirement is a directive, not a guarantee |
