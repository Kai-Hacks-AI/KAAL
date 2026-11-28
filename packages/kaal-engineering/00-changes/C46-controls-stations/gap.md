# C46 gap

| Gap | Target artefact | Baseline | Gap |
| --- | --- | --- | --- |
| engineering/G136 | F103 | `registry-run.mjs` calls `registryAt(files, station)` and `evidence-run.mjs` calls `findControls(files)`; neither passes stations | when Controls C161 takes the stations as input, both callers find no valid station and judge nothing |
