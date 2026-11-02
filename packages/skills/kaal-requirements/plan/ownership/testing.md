# Requirements ownership: Testing

This PLAN has no code and plans no new executable test. It adds documents only, so its checks are by inspection, and no Test Case is claimed passing. What counts as evidence is Testing's.

| Check | Method | Targets |
| --- | --- | --- |
| requirements/T21: the changed files are exactly the four documents under `packages/skills/kaal-requirements/plan/ownership/` | Inspection of the PR file list; the Branching and Change Isolation checks | requirements/N7 |
| requirements/T22: every piece in the map has an owner, a state and a blocker, and none planned only on a collector is called Delivered | Review against the git tree and PR states | requirements/F18 |
| requirements/T23: no document here defines a term another capability owns, and each hand-off names its owner and its PR | Review by the Intent, Architecture, Graph, Testing and Packaging owners | requirements/F19, requirements/F20 |
| requirements/T24: the sequence names no SYNC, promotion or publish as started or authorized | Inspection | requirements/N8, requirements/F21 |
| requirements/T25: the documents name `kaal-defect`, incubated in Testing, as the Defect concept owner and context as instance owner, leave Requirements owning only the obligation, keep `requirements/F10` and `T11` standing, and define no Defect identifier | Review against the Owner's decision of 2 November, 21:21 | requirements/F23, requirements/F24 |
| requirements/T26: no document frames traceability as one linear chain through Code, Tests and Evidence, or requires a Code → Architecture hop; Test Cases trace independently (Testing's) and `Serves` and `Placement` stay one-way with derived reverse views | Review against the CPO's correction on #893 | requirements/I14, requirements/F23 |

The existing planned tests `requirements/T9`–`T14` (`test/plan/love.test.mjs`) and the collector's `npm test` are unchanged and are not re-run for this PLAN. `requirements/T13` stays deferred behind `core/C29`; nothing here counts it as covered.
