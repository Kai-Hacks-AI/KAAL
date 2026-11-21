# C114 evidence

| Case | Tests | Before this Change | With it |
| --- | --- | --- | --- |
| release/T1320 | release/D12 | RED: the workflow has no source, and `branching.sh` fails a pull request without auto-merge | green |

The Case goes with the source in one pull request, so it is never RED on the collector.

## Mutations

Each caught by T1320: the original `branching.sh` (a pull request without auto-merge fails), the guard of `branching.sh` removed (the method is judged while auto-merge is off), `cancel-in-progress: false` in the source.

## What this shows and does not show

That the source says what the Defect asks and that `branching.sh`, run with a stub checker in a scratch clone, does not fail a pull request for auto-merge it does not have and still fails a wrong method. It does not show that the live check passes on the first run of a pull request: that is observed on the first pull request into a collector after the WIRE.
