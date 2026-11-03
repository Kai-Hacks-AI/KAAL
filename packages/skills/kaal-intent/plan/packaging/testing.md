# Packaging readiness (LOVE): Testing

This PLAN adds no Case and changes none. `npm test -w kaal-intent` (`intent/T1`–`T4`) is unchanged. The DO `intent/C6` plans and first observes RED each of these, in its own Change:

| Planned check | Observes | Deliberately wrong state that makes it RED |
| --- | --- | --- |
| Contract matches package | Every `installation.kaal.json` asset exists at its source and no shipped Node is missing from it | A contract that omits a Definition |
| Claim matches location | `ownership.kaal.json` names the package's real path and the Skill Node's id | A claim at the old path after a move |
| Packed contents | The packed file list equals the declared files | An extra undeclared file in the pack |
| Clean consumer | Installing the packed package into an empty consumer and registering its Nodes succeeds | A Node whose Form Core refuses |
| Verifier accounting | The shipped verifier reports declared and executed counts, and an empty run is not GREEN | A verifier that exits 0 with zero cases |
| README names the Nodes | Every Node the contract lists appears in the README | A README that omits one |

None is written or run here. Verification of this Change is review against the evidence in `intent.md` plus the required checks.
