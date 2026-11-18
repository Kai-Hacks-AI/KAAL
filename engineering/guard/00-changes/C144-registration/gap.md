# C144 gap

| Gap | Target artefact | Baseline | Gap |
| --- | --- | --- | --- |
| guard/G63 | F49 | inside a folder that has a `kaal-guard.json`, a changed file that none of its checks cover selects nothing and the run passes, and a `kaal-guard.json` with no check is accepted | forgetting to register a file in a declared folder looks like passing, and an empty declaration guards nothing |
