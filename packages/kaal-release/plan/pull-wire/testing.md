# Pull Promotion wiring: scoped ids in CI (testing)

Runnable Case `T34`, `.red.mjs`. It is RED because `engineering/cases/cases.test.mjs` does not exist and `test:engineering` does not name it. The DO moves it to `test/pull/` as `.test.mjs`. Run it from the repository root: `node -e "import('./packages/kaal-release/plan/pull-wire/T34.red.mjs').then(m => m.run())"`.

| Case | Requirement | What it shows |
| --- | --- | --- |
| pull/T34 | F35 | `test:engineering` names the Cases file. Running it on the real Cases logs every one with a recorded execution that `executionsOf` reads as a success. A fixture folder (via `KAAL_CASES_ROOT`) holds a passing Case, a deliberately failing Case and a Case without a scoped `id`: the passing one reads as a success, the failing one logs `✖ <scope>/T<n>` and reads as a **failure** (execution evidence, not missing), the file exits non-zero so qualification stays blocked, and the Case without an id is never accepted as a success. |

It does not prove that CI runs it on every host, only that the file and the script entry produce lines the report accepts. The first CI run on the collector is the live evidence.

Moved in pull/C8: `pull/T34` now lives in `packages/kaal-release/test/pull/T34.test.mjs` with its integration evidence in `test/pull/evidence/`; `test/wire.test.mjs` still runs it for `test:engineering`.
