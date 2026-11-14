# Pull Promotion: the declaration lists the candidates (testing)

Runnable Cases `T47` to `T50`, `.red.mjs`, over the committed `declaration.json` and `fixtures/deltas.json`, which holds the real file lists each candidate added on the host at the heads in `00-changes.md`. They are RED because the declaration lists none of the three yet. They are not wired into any CI run; the DO moves them to `test/pull/` as `.test.mjs`. Run from the repository root: `node -e "import('./packages/kaal-release/plan/pull-declare/T47.red.mjs').then(m => m.run())"`.

| Case | Requirement | What it shows |
| --- | --- | --- |
| pull/T47 | F46 | The five candidates are declared with a scope; every file of each real delta matches its own scope and no file of another candidate does; the existing twelve entries are unchanged. |
| pull/T48 | F47 | Every test file of each real delta is a Case or declared `other`; the collector-capability `T268` to `T279` are Cases with those ids; the retro node tests are `other`; PLAN evidence is found in each delta. |
| pull/T49 | F48 | The PLAN, DO, ACT-file and 4L-heading evidence is not narrowed: a fixture collector with no concluding ACT still does not qualify under the declaration, and a Case outside the patterns is still reported. |
| pull/T50 | F49 | A new entry carries all of `value`, `size`, `unit` or none; with none, `chooseNext` over the three qualifying fixtures is judged; a partial or invalid triple is named in `problems`. |

They do not show the live host or any value or size.
