# Pull Promotion wiring: scoped ids in CI (testing)

Runnable Case `T34`, `.red.mjs`. It is RED because `engineering/cases/cases.test.mjs` does not exist and `test:engineering` does not name it. The DO moves it to `test/pull/` as `.test.mjs`. Run it from the repository root: `node -e "import('./packages/kaal-release/plan/pull-wire/T34.red.mjs').then(m => m.run())"`.

| Case | Requirement | What it shows |
| --- | --- | --- |
| pull/T34 | F35 | `test:engineering` names the Cases file. Running it with `node --test` logs one `✔ <scope>/T<n>` line per discovered Case file, and the gatherer's `executionsOf` reads each of them as a success at the head. A throwing Case logs `✖` and reads as a failure; a Case without a scoped `id` fails and is not skipped. |

It does not prove that CI runs it on every host, only that the file and the script entry produce lines the report accepts. The first CI run on the collector is the live evidence.
