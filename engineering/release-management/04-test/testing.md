# Cases (planned)

All RED until their DO. Existing Cases: `engineering/release/release.test.mjs` (engineering/T62-T70).

| Case | Targets | Checks |
| --- | --- | --- |
| release-management/T1 | F1, G1 | a version lower than the highest published one is refused by readiness |
| release-management/T2 | F1, G2 | a release creates or verifies a tag naming the version and commit |
| release-management/T3 | F1, G3 | the version in `package.json` is the one a recorded Change set |
| release-management/T4 | F2, G5 | `release.json` names the approving run |
| release-management/T5 | F3, G9 | `release.json` names the promotion (PR or ledger entry) that put the commit on `main` |

Whether a gap becomes a Case, a decision or a documented limit is for the Owner and CPO to say.
