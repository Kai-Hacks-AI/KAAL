# Cases (retro/C2)

All Cases are in `test/plan/capability.test.mjs`, unwired, and run RED because the Nodes and the corrected claim do not exist yet. They use Core's own functions, as kaal-change's tests do, and need `kaal-core` built.

| Case | Shows | Requirement |
| --- | --- | --- |
| retro/T11 | `capability/Retro.md` is named Retro and typed by Core's KAAL Capability | R1 |
| retro/T12 | Core admits the Capability on a fresh Engine; the catalogue lists Retro with the Node's id; the Engine verifies | R3 |
| retro/T13 | `payload/Retro.md` is typed by Core's KAAL Skill and is admitted as the skill `retro` on that Engine | R2, R3 |
| retro/T14 | The ownership claim names kind `capability`, name `Retro` and the Node's exact id, claims `packages/kaal-retro/`, and names no Learning | R4 |
| retro/T15 | The collector's capability segment equals the Capability Node's name lowercased | R5 |

retro/T1 to T10 are unchanged and must still hold (R6). The Cases show the identity and admission path mechanically. They do not show that the Nodes say the right thing; that is validation by review.

Promotion remains a separate step. This Change shows the admission path and the exact-head qualification; it does not request promotion review. Nothing here authorizes a sync, promotion, publication or enforcement.
