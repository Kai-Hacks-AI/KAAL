# Cases of the Change (A to B)

The Cases that judge the migration. They are Change Cases: they turn red or green on the route, never on the target, and they end with the migration. The Cases of the target are in `../04-test/testing.md`.

| Case | Targets | Checks |
| --- | --- | --- |
| release-management/T12 | F20 | for every shim left at an old path: its export names equal the moved module's export names (compared by import, not by text), and where it has a command line, that behaves as the moved module's (same exit status and message for an unknown step; no shim has one now); in `shim-facade.test.mjs` |
| release-management/T13 | F20 | turns RED when the migration is done but F20 is still there; done is F20's own end condition, the last shim gone and nothing calling an old path; callers are found with the YAML parser (workflows) and the TypeScript AST (imports); RED also when a called shim is missing; a shim with no caller left is the normal state between the `.github` rewiring Change and the removal Change: it passes and says so; in `migration-end.test.mjs` |
| release-management/T14 | F20, T11 | the old folder `engineering/release/` holds only release.mjs, a shim that points at the moved module (run.mjs had no caller and was removed) (the migration half of the former T11); in `shim-facade.test.mjs` |
| release-management/T16 | the Target members | every entry of `current-state.md` and `gaps.md` names the target it differs from, and the target resolves in the root documents; in `documentation.test.mjs` |
| release-management/T17 | F20 | Change ids (gaps, F20, the Change Cases) are defined under `00-changes` only, and `00-changes` defines no target id |
| release-management/T18 | F20 | every temporary mechanism (`change-requirements.md`, `interim-states.md`) has an `Ends when:` that names a defined Case |
| release-management/T19 | all ids and decisions | every id and decision captured before the documentation Change has exactly one authoritative definition afterwards, where `id-moves.json` lists it; text that moved unchanged is identical, text that was reworded is listed as reworded, for the CPO to validate |
| release-management/T20 | #1323 to #1327 | `transformation.md` lists each landed Change against a target that resolves |
| release-management/T21 | F-all | no entry of the Change documents states what B must be; each has a Target and a Current or Difference member |
| release-management/T22 | F12, F16 | RED: every job of the workflow `KAAL` is claimed by a control (`05-src/lanes/claims.json`), parsed from `ci.yml`; in `04-test/lanes.red.mjs` |
| release-management/T23 | F12, F16, F18 | RED: a lane or host that is missing, skipped, cancelled or conditional fails the gate unless a FAR Accept names the lane and host; in `04-test/lanes.red.mjs` |
| release-management/T24 | F12, F16 | RED: a Case file run by two lanes on one host is declared with its reason (`05-src/lanes/overlaps.json`), found by parsing the workflow and the lane scripts; in `04-test/lanes.red.mjs` |
