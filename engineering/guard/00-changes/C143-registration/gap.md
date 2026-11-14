# C143 gap

| Gap | Target artefact | Baseline | Gap |
| --- | --- | --- | --- |
| guard/G61 | A21 and the capability standard | no `ownership.kaal.json`, no `capability/Guard.md`, contract named `contract.json`, assets target `.githooks`/`.github`/`.agents` and nothing under `.kaal/` | Guard cannot be admitted by Core as a capability nor deployed into `.kaal/` |
| guard/G62 | F43 to F45, F48 (F46 and F47 withdrawn) | only `.kaal/config/guard/` is read; a Solution or a Change cannot register a check; every declaration runs every time | no registration, no execution integrity for registrations, no consumption of the Engine's execution plan |
