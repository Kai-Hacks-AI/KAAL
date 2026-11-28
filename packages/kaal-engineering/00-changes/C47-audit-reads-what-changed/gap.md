# C47 gap

| Gap | Target artefact | Baseline | Gap |
| --- | --- | --- | --- |
| engineering/G137 | F104 | every push, a deletion included, reads the whole activity and all pull requests with `--paginate` (one call per 100 records), and on a push to `main` also runs the Lifecycle audit on them; nothing says how many calls a run made | a day of merges spends the shared token's budget on one landing at a time; a run's cost is unmeasured |
