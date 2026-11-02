# Intent ownership and the traceability chain: Intent

> PLAN (`intent/C3`). It ships no code, no Node and no test. It authorizes no synchronization, promotion, version change or npm publication, which remain the Owner's. It answers the CPO handover of 2 Nov 2026 and the Engineering portfolio assessment (#886, gap C2): Intent has had a collector and two Changes but no owning thread, and the chain Intent → Requirements → Architecture → Code → Tests → Evidence is not connected end to end.

- **intent/I3.** Intent has one owner and a stated scope. The owning thread keeps `kaal/intent`, `packages/skills/kaal-intent/` and its plan, and answers for what an Intent is. It does not take over what Requirements, Architecture, Testing, Graph or Engineering own.
- **intent/I4.** The chain is a map before it is a mechanism. Each link between two disciplines names its owner, its state today and its blocker, so the CPO and the CTO can decide the order from evidence instead of from memory. No link is invented, and none is built by this Change.
- **intent/I5.** Intent is the head of the chain and depends on nothing in it. An Intent exists without any Requirement, Change or conversation (`intent/F1`). Traceability points at an Intent, never from it.

## What exists today

Evidence is the git tree of `origin/main` (`d8bdf9b`) and of `origin/kaal/intent`, `kaal/requirements`, `kaal/architecture` and `kaal/graph`, and the PR titles named. Nothing was run for this PLAN.

| Capability | Where | State | Open work |
| --- | --- | --- | --- |
| Intent | `kaal/intent` (not on main, 45 ahead / 47 behind) | `kaal-intent` 0.0.1: `Intent`, `IDEA` and `I WON` Definitions, the Skill, an ownership claim (`intent/C2`, #748). Intent elements `<capability>/I<n>` can be Nodes; none is yet | none |
| Requirements | `kaal/requirements` | Requirement Definition; `requirements/C10` PLAN (#741) for the `Serves` Edge to an Intent | none |
| Architecture | `kaal/architecture` | Architecture Node, URBAN, Skill, Installation Contract; `architecture/C8` optional composition with Requirements | none |
| Graph | `main`, unscoped | Nodes, Edges, `traverse`, `check`; the means every link uses | #659, #823, #825 and the held #621 promotion |
| Testing | `kaal/testing` | Case design and execution; trace derivation (`testing/C48`, #745) planned, deferred from 0.0.1 | #745 |
| Packaging | `kaal/packaging` | dependency traces Graph can traverse (`packaging/C10`, #746) | #746, #881 |
| Engineering | `main` | Change Isolation by reverse traceability: ledger rule on main (#880); the DO (#739, draft) waits on the prerequisites above | #739 |

All of Intent, Requirements and Architecture sit outside main's lineage: they share a merge base (`86b2c44`) with main but have never been promoted, and each is far behind. That is Engineering's lineage question (#886 gap C5), not decided here.
