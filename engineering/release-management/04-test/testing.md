# Cases (planned)

All RED until their DO. Each Case is placed next to its component in its `05-src/` component (`pipeline/`, `npmjs/`, `main/` or `collectors/`) when its Change lands; until then they are listed here. Existing Cases: `engineering/release/release.test.mjs` (engineering/T62-T70).

| Case | Targets | Checks |
| --- | --- | --- |
| release-management/T1 | F3, G1 | a version lower than the highest published one is refused by readiness |
| release-management/T2 | F3, G2 | a release creates or verifies a tag naming the version and commit |
| release-management/T3 | F3, G3 | the version in `package.json` is the one a recorded Change set |
| release-management/T4 | F1, G5 | `release.json` names the approving run |
| release-management/T5 | F2, G9 | `release.json` names the promotion (PR or ledger entry) that put the commit on `main` |
| release-management/T6 | F4 | every control in the Architecture mapping has a name on each surface where it runs (record, `05-src`, workflow job), and every workflow job, gate and `05-src` component (`pipeline/`, `npmjs/`, `main/`, `collectors/`) maps to its allocated controls; read by parsers (YAML, Markdown AST, directory listing); an unmapped or missing name is reported, exact string equality is not required |
| release-management/T7 | F6 | a change touching `.github/` and one path outside it fails (exit 1, not a warning) with base `kaal/*`, and with base `main`; a lone `.github` change passes; an adopted synchronization is exempt; the `.github` test reads paths as a path (split on `/`), not a regex over text |
| release-management/T8 | F6 to F14 | each `release/*` job checks out `main` and runs a script under `engineering/release-management/05-src/`; no job runs a script from the candidate's checkout; read by the YAML parser (job steps: `uses: actions/checkout` with `ref` the default branch, the run target a `05-src` path); the testing controls' machinery is pinned like the others, and their Cases follow F18 (T9) |
| release-management/T9 | F18 | in a candidate that edits, deletes or skips a Regression Case, test Candidate and test Integration run the target's version of that Case and fail; the same change with a matching Accepts entry passes; a candidate's new Case runs as a Feature; a change adding an Accepts entry needs the same approval as any change; the run's output (job summary) lists each applied Accepts entry with the Case and the kind of weakening, and says "no Accepts applied" when there are none; Features and Regression are both reported |

Whether a gap becomes a Case, a decision or a documented limit is for the Owner and CPO to say.
