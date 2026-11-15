# C26 gap

| Gap | Target artefact | Baseline | Gap |
| --- | --- | --- | --- |
| release/G60 | F21 and A46: githooks, legacy and new | one hook, `.githooks/pre-push`, holds today's checks, and nothing separates a legacy check from a new one | a new hook cannot be installed beside the legacy one, and the legacy one cannot be retired control by control |
