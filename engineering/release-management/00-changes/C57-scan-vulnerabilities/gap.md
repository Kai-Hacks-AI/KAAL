# C57 gap

| Gap | Target artefact | Baseline | Gap |
| --- | --- | --- | --- |
| release/G86 | release/CTL6 answering release/I31 | release/CTL2 sees only the dependencies a change adds or changes; nothing reads the lockfile of `main` on a schedule | an advisory published against a dependency already on `main` is not seen until a change touches it |
