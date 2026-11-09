# Cases (planned)

All RED until their DO. Existing Cases: `engineering/release/release.test.mjs` (engineering/T62-T70).

| Case | Targets | Checks |
| --- | --- | --- |
| release-management/T1 | F3, G1 | a version lower than the highest published one is refused by readiness |
| release-management/T2 | F3, G2 | a release creates or verifies a tag naming the version and commit |
| release-management/T3 | F3, G3 | the version in `package.json` is the one a recorded Change set |
| release-management/T4 | F1, G5 | `release.json` names the approving run |
| release-management/T5 | F2, G9 | `release.json` names the promotion (PR or ledger entry) that put the commit on `main` |
| release-management/T6 | F4 | the station and control names from the Architecture list are the same in Intent, Requirements, `05-src` names and the workflow/job/gate names, read by parsers (YAML, Markdown AST, directory listing); a missing or misspelled name fails |

Whether a gap becomes a Case, a decision or a documented limit is for the Owner and CPO to say.
