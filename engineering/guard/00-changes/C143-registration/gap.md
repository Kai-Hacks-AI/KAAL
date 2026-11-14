# C143 gap

| Gap | Target artefact | Baseline | Gap |
| --- | --- | --- | --- |
| guard/G61 | A21 and the capability standard | no `ownership.kaal.json`, no `capability/Guard.md`, contract named `contract.json`, assets target `.githooks`/`.github`/`.agents` and nothing under `.kaal/` | Guard cannot be admitted by Core as a capability nor deployed into `.kaal/` |
| guard/G62 | F43 to F47 | only `.kaal/config/guard/` is read, every declaration runs every time, a candidate can delete a declaration | a capability or a Change cannot register a check; nothing keeps a registration safe from its own candidate or from a cross-owner addition; nothing selects by capability in flight |
