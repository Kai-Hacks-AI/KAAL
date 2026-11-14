# Pull Promotion: where a Case sits and how it is logged (testing)

Runnable Cases `T36` and `T37`, `.red.mjs`. Neither loads the gatherer. They are not wired into any CI run; the DO moves them to `test/pull/` as `.test.mjs`. Run from the repository root: `node -e "import('./packages/kaal-release/plan/pull-ids/T36.red.mjs').then(m => m.run())"`.

| Case | Requirement | What it shows |
| --- | --- | --- |
| pull/T36 | F37 | Every `T<n>.test.mjs` under `packages/kaal-release/test/<scope>/` exports the id `<scope>/T<n>`, and no `T<n>.test.mjs` remains under `packages/kaal-release/plan/<change>/`. It is RED today for `pull/T34` (in `test/wire/`) and the twelve Show WIP Cases (in `plan/`). |
| pull/T37 | F37 | Running `test/show-wip.test.mjs` and `test/wire.test.mjs` as CI does prints, for each of `coordination/T33` to `coordination/T44` and `pull/T34`, one execution line whose mark is a success, and the Case file sits at the path its id names. It is RED today: the Show WIP lines carry bare ids and the files are not at those paths. |

They do not show the live host: the live run on the synchronized `kaal/release/plan` is the DO's integration evidence.
