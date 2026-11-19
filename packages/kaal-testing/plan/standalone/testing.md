# Standalone use of kaal-testing: Testing

The planned Cases live in `packages/kaal-testing/test/plan/standalone/`, named `T<n>.red.mjs` with `lib.mjs` and `run-red.mjs`. Each exports `id`, `tests`, `title` and `run()`. They are immutable to DO. `testing/C66` renames them `.test.mjs`, adds a wrapper to Testing's `npm test` and records the trial. They need network access to the registry for Hosting and `c8`.

| Case | Checks | What it decides |
| --- | --- | --- |
| testing/T370: a packed kaal-testing installs into an empty project and runs the consumer's own tests | testing/F146 | command linked, one GREEN and one RED counted on a consumer file, ids relative to the project, `kaal-testing/run` loads, nothing written into the project |
| testing/T371: only Hosting, Foundation and `c8`, nothing else of KAAL | testing/F147, testing/N32 | declared set, versions not paths, installed tree holds no other KAAL package, every import built in or declared |
| testing/T372: no name from outside the package | testing/N32 | scan of the installed files for repository paths, other packages, outside roles and process vocabulary |
| testing/T373: the judged use | testing/F148 | key valid, fixture yields the key's counts with the installed package, three recorded runs with isolation, quotes found in the transcript, every must item met |

T371 is GREEN at `main` because the declared dependencies already hold; it protects what we have (a regression Case in the FAR sense) and is renamed with the rest. T370 and T373 need the runner of testing/C64: on `main` today they are RED because the command is absent, and after the promotion of that collector they are RED only for what is missing here (T370 can already pass then; T373 needs the recorded runs).

## RED evidence

`node packages/kaal-testing/test/plan/standalone/run-red.mjs`. See `evidence.md`.
