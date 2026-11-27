# C39 gap

| Gap | Target artefact | Baseline | Gap |
| --- | --- | --- | --- |
| engineering/G129 | embed Acceptance Case | the Case imports `capabilities` from the installed `kaal-core` | Core's removal of `capabilities()` (core C156) would make the Case fail at import |
