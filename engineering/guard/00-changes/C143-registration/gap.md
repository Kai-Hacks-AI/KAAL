# C143 gap

| Gap | Target artefact | Baseline | Gap |
| --- | --- | --- | --- |
| guard/G61 | A21 and the capability standard | no `ownership.kaal.json`, no `capability/Guard.md`, contract named `contract.json`, assets target `.githooks`/`.github`/`.agents` and nothing under `.kaal/` | Guard cannot be admitted by Core as a capability nor deployed into `.kaal/` |
| guard/G62 | F43 to F45 (F46 to F48 withdrawn) | only `.kaal/config/guard/` is read; a package or a Change cannot say which checks apply to it; every declaration runs every time | no `kaal-guard.json` discovery, no selection by changed file, no consumption of the Engine's plan |
