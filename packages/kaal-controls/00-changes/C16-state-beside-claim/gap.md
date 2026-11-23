# C16 gap

| Gap | Target artefact | Baseline | Gap |
| --- | --- | --- | --- |
| controls/G93 | F29 and A15 in `packages/kaal-controls` | `main`: `evidence.mjs` judges only controls that claim `tested` and prints JSON; a control below `tested` shows no progress and no computed state | `computedState`, `stateLine`, a line per control that declares a minimum whatever its claim, and the reference text are absent |
