# RATIFICATION, a repository-selectable Change discipline

Capability: `kaal-change`. Collector: `kaal/change`.

## Why

The Owner approved one bounded RATIFICATION Definition Change, to open once RATS! has an established home. RATIFICATION is an established Change-owned discipline, not a mandatory universal pipeline.

- The Owner's approval, with the strengthened PLAN invariant, is in Slack #kaal, thread "Change · RATIFICATION" (ts 1792349855.120579).
- RATS! got its home in Engineering through KAAL #285 (`engineering/RATS.md`, name "RATS!", id `a48af26b…f9bf`).

## How

- `capability/RATIFICATION.md` is a new `KAAL Definition`. It keeps the canonical expansion and two distinct Tests. The whole planned test set is the immutable acceptance boundary. DO and CHECK repeat until every planned test is GREEN and never modify a test that PLAN established. Planning defects go to ACT and a subsequent PLAN, and ACT itself is not defined here. GREEN is evidence, not proof of the Outcome.
- `capability/Change.md` now provides the RATIFICATION Definition. `ownership.kaal.json` carries the Capability Node's new id, `README.md` lists the Definition, and `test/ratification.test.mjs` covers it.

## Linked, not repeated

- RATS! (Engineering) aligns Requirements, Architecture and Testing. RATIFICATION applies it and takes none of its parts.
- Testing owns what planned tests mean as evidence. Its invariant that PLAN-established tests are immutable to DO and CHECK is in KAAL #282.
- Intent owns the Outcome.

## Evidence

`npm test -w kaal-change` checks that the Definition is admitted, carries the verbatim expansion, is repository-selectable and keeps two distinct Tests. It also checks that DO and CHECK cannot modify planned tests, that ACT is not defined, that GREEN counts as evidence only, and that the Definition cites no earlier repository.
