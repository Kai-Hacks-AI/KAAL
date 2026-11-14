# Pull Promotion: where a Case sits and how it is logged (testing)

Runnable Cases `T36` and `T37`, `.red.mjs`. Neither loads the gatherer. They are not wired into any CI run; the DO moves them to `test/pull/` as `.test.mjs`. Run from the repository root: `node -e "import('./packages/kaal-release/plan/pull-ids/T36.red.mjs').then(m => m.run())"`.

| Case | Requirement | What it shows |
| --- | --- | --- |
| pull/T36 | F37 | The inventory is derived from the declaration itself: its Case patterns applied to the files of `packages/kaal-release`, an id being the captured group. Every inventory entry must equal the id its Case exports, no `T<n>.test.mjs` may remain under `plan/<change>/`, and each of the thirteen named Cases (`coordination/T33` to `T44`, `pull/T34`) must be in the inventory, so a missing Case cannot be hidden by other files. It is RED today for the twelve Show WIP Cases (in `plan/`) and `pull/T34` (in `test/wire/`). |
| pull/T37 | F37 | Running `test/show-wip.test.mjs` and `test/wire.test.mjs` as CI does prints, for each of `coordination/T33` to `coordination/T44` and `pull/T34`, one execution line whose mark is a success, and the Case file sits at the path its id names. It is RED today: the Show WIP lines carry bare ids and the files are not at those paths. |

They do not show the live host: the live run on the synchronized `kaal/release/plan` is the DO's integration evidence.

Delivered by the DO: both Cases are now `test/pull/T36.test.mjs` and `test/pull/T37.test.mjs`, GREEN.
