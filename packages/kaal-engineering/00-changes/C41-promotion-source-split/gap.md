# C41 gap

| Gap | Target artefact | Baseline | Gap |
| --- | --- | --- | --- |
| engineering/G131 | F100 | `promotionSource` judges the origin of the head and the green checks in one function, and `notGreen` is not exported | Release cannot call either part on its own through `runControl` |
