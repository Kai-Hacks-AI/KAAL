# C42 gap

| Gap | Target artefact | Baseline | Gap |
| --- | --- | --- | --- |
| engineering/G132 | F101 | `ci.yml` runs on `push` to `main` and `kaal/**` and on `pull_request`, with no `concurrency` group | a Change branch with an open pull request is tested twice per push, and a superseded run keeps its runner, so the macOS queue grows |
