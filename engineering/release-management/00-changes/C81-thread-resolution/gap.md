# C81 gap

Gap id `release/G104`.

| Target artefact | Baseline | Gap |
| --- | --- | --- |
| release/CTL10 answering a thread Intent | one Intent, release/I36 | no Intent says an open review thread blocks the merge |
| `integrating.json` | thread resolution false | an unresolved thread does not block a merge into `kaal/**`, `hotfix/**` or `wire/**` once the old integration ruleset retires |
| `stages.json` | declares thread resolution false | the declaration would contradict the new source |
| bot output | no statement | nothing states that a bot never opens a thread, so a later bot could block its own SYNC |
