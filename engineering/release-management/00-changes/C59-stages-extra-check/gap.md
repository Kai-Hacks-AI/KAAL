# C59 gap

| Gap | Target artefact | Baseline | Gap |
| --- | --- | --- | --- |
| release/G88 | `05-src/stages/judge.mjs` | the judge fails every check a ruleset requires beyond its own | a stage cannot declare a second required check, so a preventive control that adds one cannot pass verify Stages |
