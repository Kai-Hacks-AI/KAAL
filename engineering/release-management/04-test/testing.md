# Cases

The Cases of the target (B). Each Case sits next to its component under `05-src/`; the root traces it to its requirement. The Cases of the migration (A to B) are in `../00-changes/cases.md`.

| Case | Targets | Checks |
| --- | --- | --- |
| release-management/T1 | F3 | a version lower than the highest published one is refused by readiness |
| release-management/T2 | F3 | a release creates or verifies a tag naming the version and commit |
| release-management/T3 | F3 | the version in `package.json` is the one a recorded Change set |
| release-management/T4 | F1 | `release.json` names the approving run |
| release-management/T5 | F2 | `release.json` names the promotion (PR or ledger entry) that put the commit on `main` |
| release-management/T6 | F4 | every control in the Architecture mapping has a name on each surface where it runs (record, `05-src`, workflow job), and every workflow job, gate and `05-src` component (`lineage/`, `change-isolation/`, `release-engine/`, `promotion-source/`, `merge-group/`, `lanes/`) maps to its allocated controls; read by parsers (YAML, Markdown AST, directory listing); an unmapped or missing name is reported, exact string equality is not required |
| release-management/T7 | F6 | a change touching `.github/` and one path outside it fails (exit 1, not a warning) with base `kaal/*`, and with base `main`; a lone `.github` change passes; an adopted synchronization is exempt; the `.github` test reads paths as a path (split on `/`), not a regex over text |
| release-management/T8 | F6 to F14 | each job of the `KAAL / release / *` workflows checks out `main` and runs a script under `engineering/release-management/05-src/`; no job runs a script from the candidate's checkout; read by the YAML parser (job steps: `uses: actions/checkout` with `ref` the default branch, the run target a `05-src` path); the testing controls' machinery is pinned like the others, and their Cases follow F18 (T9) |
| release-management/T9 | F18 | in a candidate that edits, deletes or skips a Regression Case, test Candidate and test Integration run the target's version of that Case and fail; the same change with a matching Accepts entry passes; a candidate's new Case runs as a Feature; an entry that matches no Regression Case is a finding and fails; accepted Cases stay observed RED while the Plan's result succeeds; a change adding an Accepts entry needs the same approval as any change; the run's output (job summary) lists each applied Accepts entry with the Case and its justification, and says "no Accepts applied" when there are none; Features and Regression are both reported |
| release-management/T10 | F17 | live negative Cases for the trust root: a `.github`-only candidate that removes or edits the gate or a control job, a candidate job named like a required context, and a candidate that skips a required control each leave the required context failed or absent; the gate rejects absent, skipped, stale, cancelled and timed-out runs and prints the head SHA and the `main` checkout SHA |
| release-management/T11 | F1, F2, F3 | the Release engine lives in `05-src/release-engine/`; the engine's source Cases (`release.test.mjs`) sit next to it |
| release-management/T38 to T45 | I1 | `track Work` tells each role what to work on next from the facts the controls hold: Work is sorted into about to open, in stock or about to close per station, a role is required, the envelope is read from its control's verdict and unread facts are shown; the Cases sit in `05-src/track-work/` |
| release-management/T15 | I1 to I7, F1 to F18, A1 to A3 | the root documents describe the target only: no heading, label, column or word of them speaks of the route, the evidence, a difference to the present state, a temporary mechanism or a moment in time; those belong to Change (`../00-changes`); read with the Markdown parser |

Whether a gap becomes a Case, a decision or a documented limit is for the Owner and CPO to say.
