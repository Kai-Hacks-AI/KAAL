# Test Locations by Purpose and Owner: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **testing/F76** [testing/I20]: **The locations.**
  - **`test/embed/`** holds a capability's own cases. They ship with its package, and its own `npm test` runs them against the installed copy. `discover` never reads them.
  - **`test/engineer/`** holds Engineering's lane scenarios for that workspace's package. Each one `install()`s the run's packed tarballs. `discover(workspaces)` gives every `*.test.mjs` directly in it.
  - **No other location.** There is no `test/external/` convention, and `discover` reads no other location except testing/F77's.

  The location alone decides. Neither `package.json` `files` nor any other declaration changes what `discover` gives.
- **testing/F77** [testing/I20]: **A bounded migration.** Until the migration completes, `discover` also reads `test/acceptance/` as the lane's, beside `test/engineer/`. So no lane scenario is lost before its owner moves it. The migration completes in `testing/C45`, a later PLAN raised once no workspace keeps `test/acceptance/`. That PLAN amends this requirement and testing/T90.
- **testing/F78** [testing/I20]: The README's acceptance section states the locations:
  - `test/embed/` holds a capability's own cases, run by its own `npm test`;
  - `test/engineer/` holds Engineering's lane scenarios, which `install()`;
  - there is no `test/external/`;
  - locations are not Testing kinds.
- **Amendment of testing/F61 and testing/A21** (`testing/C35`). Testing's own delivered cases ship in `test/embed/`. Each case's loop is its trace in the model, not its directory. testing/T76 and testing/T79 read `test/embed/` accordingly, and assert what they did before.

## Nonfunctional

- **testing/N16** [testing/I20]: `discover`'s signature and result shape are unchanged: `[{ workspace, path }]`, sorted by path. It still reads through Hosting only and writes nothing. No Testing kind, model field or trace is added.

## Not in this Change

- Moving any capability's files. The migration sequence below says whose Change moves which files.
- Running a capability's embedded cases. That is its own `npm test`, and Engineering's consumer lane.
