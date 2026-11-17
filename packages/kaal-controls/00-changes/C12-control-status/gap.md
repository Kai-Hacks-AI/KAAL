# C12 gap

| Gap | Target artefact | Baseline | Gap |
| --- | --- | --- | --- |
| controls/G89 | F19 to F22 and A10 in `packages/kaal-controls`, F23 and A11 in `engineering/controls` | `main` has a control declaration with no `status`, refuses an item that carries one, and has no check that tells an owner what to fix | the finder that lists a status, the package check and its recovery, and Engineering's deployment of it are absent |
