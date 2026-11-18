# C67 baseline

The baseline is `main`. Work that is not on `main` is not delivered functionality.

- `05-src/plan-body/envelope.mjs` judges the route of a pull request by its TYPE: a HOTFIX needs a head under `hotfix/` and its base is reported as not judged; a PROMOTION needs base `main` and a head under `kaal/`; a SYNC needs a base under `kaal/`; and a head under `hotfix/` under any other TYPE is a finding that it must be a HOTFIX.
- The requirement `02-requirements/F17-envelope-rules/F17.md` states these rows in words (the Route and the HOTFIX body and head lines).
- Six Cases assert the old route: release/T161, T188, T189, T190, T191 and T192.
- The agreed flow is a HOTFIX into `hotfix/*` from a Development branch, a PROMOTION from `hotfix/*` into `main`, and a SYNC into `kaal/*`, `hotfix/*` or `wire/*` (release/C63 and release/C58 argue from it). The check is not wired: it runs by hand (`node envelope.mjs <facts file>`, release/A33); no workflow, ruleset or hook runs it, and it is not declared as a control. The agreed route is therefore refused only when someone runs it, and would be refused by any gate made of it.
